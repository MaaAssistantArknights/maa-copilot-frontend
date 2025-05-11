import {
  Button,
  Callout,
  H1,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useRef, useState } from 'react'

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
  title?: string
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  submitAction,
  onSubmit,
}) => {
  return (
    <div className="px-4 md:px-8 flex flex-wrap bg-white dark:bg-[#383e47]">
      <div className="py-2 flex items-center ">
        <Icon icon="document" />
        <H1 className="!text-lg font-normal ml-1 mb-0">作业编辑器v2</H1>
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
      statusResetTimer.current = setTimeout(() => {
        statusResetTimer.current = null
        setStatus('idle')
      }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
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
              每隔 {AUTO_SAVE_INTERVAL / 1000 / 60} 分钟自动保存编辑过的内容 (
              {archive.length}/{AUTO_SAVE_LIMIT})
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
                      message: '无法保存: ' + formatError(e),
                      intent: 'danger',
                    })
                  }
                }}
              >
                立即保存
              </Button>
            </Callout>
            <Menu className="mt-2 p-0">
              {archive.map((record) => (
                <MenuItem
                  multiline
                  icon="time"
                  text={record.v.operation.doc.title || '无标题'}
                  label={formatRelativeTime(record.t)}
                  key={record.t}
                  onClick={() => {
                    edit(() => {
                      setEditorState(record.v)
                      return {
                        action: 'restore',
                        desc: '从自动保存恢复',
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
      <Button minimal large icon="projects" title="自动保存" />
    </Popover2>
  )
}

const HistoryButtons = () => {
  const { history, canRedo, canUndo } = useHistoryValue(historyAtom)
  const { undo, redo, checkout } = useHistoryControls(historyAtom)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button
        minimal
        large
        icon="undo"
        title="撤销 (Ctrl+Z)"
        disabled={!canUndo}
        onClick={undo}
      />
      <Button
        minimal
        large
        icon="redo"
        title="重做 (Ctrl+Y)"
        disabled={!canRedo}
        onClick={redo}
      />
      <Popover2
        content={
          isOpen ? (
            <Menu>
              <MenuDivider
                className="pb-2 border-b"
                title={`操作历史 (上限${history.limit})`}
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
                    text={index + 1 + '. ' + record.desc}
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
          title="操作历史"
          text={history.index + 1 + '/' + history.stack.length}
        />
      </Popover2>
    </>
  )
}

const ErrorButton = () => {
  const globalErrors = useAtomValue(editorAtoms.globalErrors)
  const entityErrors = useAtomValue(editorAtoms.entityErrors)
  const [isOpen, setIsOpen] = useState(false)
  const allErrors = globalErrors.concat(Object.values(entityErrors).flat())
  return (
    <Popover2
      content={
        isOpen ? (
          <>
            <MenuDivider className="pb-2 border-b" title="错误" />
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
        title={allErrors.length > 0 ? '错误' : '无错误'}
        text={allErrors.length || undefined}
      />
    </Popover2>
  )
}

const ErrorVisibleButton = () => {
  const [visible, setVisible] = useAtom(editorAtoms.errorsVisible)
  return (
    <Button
      minimal
      large
      icon="eye-open"
      active={visible}
      onClick={() => setVisible(!visible)}
      title="在编辑器中显示错误"
    />
  )
}
