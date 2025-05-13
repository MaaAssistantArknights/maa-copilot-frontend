import {
  Button,
  Callout,
  H2,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useRef, useState } from 'react'

import { i18n, useTranslation } from '../../i18n/i18n'
import { formatError } from '../../utils/error'
import { formatRelativeTime } from '../../utils/times'
import { RelativeTime } from '../RelativeTime'
import { AppToaster } from '../Toaster'
import { Settings } from './Settings'
import { editorAtoms, historyAtom, useEdit } from './editor-state'
import { useHistoryControls, useHistoryValue } from './history'
import { SourceEditorButton } from './source/SourceEditor'
import {
  AUTO_SAVE_INTERVAL,
  AUTO_SAVE_LIMIT,
  editorArchiveAtom,
  editorSaveAtom,
} from './useAutoSave'
import { getLabeledPath } from './validation/schema'

interface EditorToolbarProps extends SubmitButtonProps {
  subtitle?: string
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  subtitle,
  submitAction,
  onSubmit,
}) => {
  const t = useTranslation()
  return (
    <div className="px-4 md:px-8 flex items-center flex-wrap bg-white dark:bg-[#383e47]">
      <Icon icon="properties" />
      <div className="ml-2 flex items-baseline">
        <H2 className="!text-base mb-0">
          {t.components.editor2.EditorToolbar.title}
        </H2>
        {subtitle && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        )}
      </div>
      <div className="grow py-2 flex flex-wrap items-center">
        <span className="grow" />
        <Settings />
        <AutoSaveButton />
        <HistoryButtons />
        <ErrorVisibleButton />
        <ErrorButton />
        <SourceEditorButton minimal />
        <span className="grow max-w-6" />
        <SubmitButton submitAction={submitAction} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

interface SubmitButtonProps {
  submitAction: string
  onSubmit: () => Promise<void | false> | false | void
}

const SubmitButton = ({ submitAction, onSubmit }: SubmitButtonProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const statusResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = async () => {
    if (submitting || status !== 'idle') return
    setSubmitting(true)
    try {
      const result = await onSubmit()
      if (result !== false) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (e) {
      setStatus('error')
      console.error(e)
    } finally {
      statusResetTimer.current = setTimeout(() => {
        statusResetTimer.current = null
        setStatus('idle')
      }, 2000)
      setSubmitting(false)
    }
  }
  return (
    <Button
      large
      intent={
        status === 'success'
          ? 'success'
          : status === 'error'
            ? 'danger'
            : 'primary'
      }
      className="w-40"
      icon={status === 'success' ? 'tick' : 'upload'}
      loading={submitting}
      text={submitAction}
      onClick={handleSubmit}
    />
  )
}

const AutoSaveButton = () => {
  const t = useTranslation()
  const edit = useEdit()
  const archive = useAtomValue(editorArchiveAtom)
  const save = useSetAtom(editorSaveAtom)
  const setEditorState = useSetAtom(editorAtoms.editor)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Popover2
      content={
        isOpen ? (
          <>
            <Callout
              intent="primary"
              icon={null}
              className="p-0 pl-2 flex items-center"
            >
              {t.components.editor2.EditorToolbar.auto_save_interval({
                count: AUTO_SAVE_INTERVAL / 1000 / 60,
                records: archive.length,
                limit: AUTO_SAVE_LIMIT,
              })}
              <Button
                minimal
                icon="floppy-disk"
                intent="primary"
                className=""
                onClick={() => {
                  try {
                    save()
                  } catch (e) {
                    AppToaster.show({
                      message:
                        i18n.components.editor2.EditorToolbar.cannot_save({
                          error: formatError(e),
                        }),
                      intent: 'danger',
                    })
                  }
                }}
              >
                {t.components.editor2.EditorToolbar.save_now}
              </Button>
            </Callout>
            <Menu className="mt-2 p-0">
              {archive.map((record) => (
                <MenuItem
                  multiline
                  icon="time"
                  text={
                    record.v.operation.doc.title ||
                    t.components.editor2.EditorToolbar.untitled
                  }
                  label={formatRelativeTime(record.t)}
                  key={record.t}
                  onClick={() => {
                    edit(() => {
                      setEditorState(record.v)
                      return {
                        action: 'restore',
                        desc: i18n.actions.editor2.restore_from_autosave,
                        squash: false,
                      }
                    })
                  }}
                />
              ))}
            </Menu>
          </>
        ) : (
          <span />
        )
      }
      placement="bottom"
      onOpening={() => setIsOpen(true)}
      onClosed={() => setIsOpen(false)}
    >
      <Button
        minimal
        large
        icon="projects"
        title={t.components.editor2.EditorToolbar.auto_save}
      />
    </Popover2>
  )
}

const HistoryButtons = () => {
  const t = useTranslation()
  const { history, canRedo, canUndo } = useHistoryValue(historyAtom)
  const { undo, redo, checkout } = useHistoryControls(historyAtom)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button
        minimal
        large
        icon="undo"
        title={t.components.editor2.EditorToolbar.undo}
        disabled={!canUndo}
        onClick={undo}
      />
      <Button
        minimal
        large
        icon="redo"
        title={t.components.editor2.EditorToolbar.redo}
        disabled={!canRedo}
        onClick={redo}
      />
      <Popover2
        content={
          isOpen ? (
            <Menu>
              <MenuDivider
                className="pb-2 border-b"
                title={t.components.editor2.EditorToolbar.undo_history_header({
                  limit: history.limit,
                })}
              />
              {[...history.stack].reverse().map((record, reversedIndex) => {
                const index = history.stack.length - 1 - reversedIndex
                return (
                  <MenuItem
                    key={index}
                    className={clsx(
                      index === 0 && 'italic',
                      index === history.index ? 'font-bold' : undefined,
                    )}
                    text={
                      index +
                      1 +
                      '. ' +
                      (record.action === 'init'
                        ? t.actions.editor2.init
                        : record.desc)
                    }
                    labelElement={
                      <RelativeTime
                        className="ml-4 text-xs"
                        moment={record.time}
                      />
                    }
                    onClick={() => checkout(index)}
                  />
                )
              })}
            </Menu>
          ) : (
            <span />
          )
        }
        placement="bottom"
        onOpening={() => setIsOpen(true)}
        onClosed={() => setIsOpen(false)}
      >
        <Button
          minimal
          icon="history"
          title={t.components.editor2.EditorToolbar.undo_history}
          text={history.index + 1 + '/' + history.stack.length}
        />
      </Popover2>
    </>
  )
}

const ErrorButton = () => {
  const t = useTranslation()
  const globalErrors = useAtomValue(editorAtoms.globalErrors)
  const entityErrors = useAtomValue(editorAtoms.entityErrors)
  const [isOpen, setIsOpen] = useState(false)
  const allErrors = globalErrors.concat(Object.values(entityErrors).flat())
  return (
    <Popover2
      content={
        isOpen ? (
          <>
            <MenuDivider
              className="pb-2 border-b"
              title={t.components.editor2.EditorToolbar.errors_header}
            />
            <ul className="m-2 text-red-500">
              {allErrors.map(({ path, message }) => (
                <li key={path.join()}>
                  <span className="font-bold">{getLabeledPath(path)}: </span>
                  {message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span />
        )
      }
      placement="bottom"
      isOpen={isOpen}
      onInteraction={(isOpen) => setIsOpen(allErrors.length > 0 && isOpen)}
    >
      <Button
        minimal
        large
        icon={allErrors.length > 0 ? 'cross-circle' : 'tick-circle'}
        intent={allErrors.length > 0 ? 'danger' : 'success'}
        title={
          allErrors.length > 0
            ? t.components.editor2.EditorToolbar.errors_header
            : t.components.editor2.EditorToolbar.no_errors
        }
        text={allErrors.length || undefined}
      />
    </Popover2>
  )
}

const ErrorVisibleButton = () => {
  const t = useTranslation()
  const [visible, setVisible] = useAtom(editorAtoms.errorsVisible)
  return (
    <Button
      minimal
      large
      icon="eye-open"
      active={visible}
      onClick={() => setVisible(!visible)}
      title={t.components.editor2.EditorToolbar.show_errors}
    />
  )
}
