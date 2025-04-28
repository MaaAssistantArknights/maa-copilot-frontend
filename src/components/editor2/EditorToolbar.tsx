import {
  Button,
  Callout,
  Divider,
  H1,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Tab,
  Tabs,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useRef, useState } from 'react'

import { formatError } from '../../utils/error'
import { joinJSX } from '../../utils/react'
import { formatRelativeTime } from '../../utils/times'
import { RelativeTime } from '../RelativeTime'
import { AppToaster } from '../Toaster'
import {
  editorAtoms,
  useEditorControls,
  useEditorHistory,
} from './editor-state'
import { SourceEditorButton } from './source/SourceEditor'
import {
  AUTO_SAVE_INTERVAL,
  AUTO_SAVE_LIMIT,
  editorArchiveAtom,
  editorSaveAtom,
} from './useAutoSave'
import { getLabeledPath } from './validation/schema'
import {
  editorEntityErrorsAtom,
  editorErrorsVisibleAtom,
  editorGlobalErrorsAtom,
} from './validation/validation'

interface EditorToolbarProps extends SubmitButtonProps {
  title?: string
  tabs: { id: string; name: string }[]
  selectedTab: string
  onTabChange: (id: string) => void
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  submitAction,
  onSubmit,
}) => {
  return (
    <div className="px-4 md:px-8 flex flex-wrap bg-white dark:bg-[#383e47]">
      <div className="py-2 flex items-center ">
        <Icon icon="document" />
        <H1 className="!text-lg font-normal ml-1 mb-0">作业编辑器v2</H1>
      </div>
      <Tabs
        className="ml-4 self-stretch pl-4 pr-2 [&>div]:h-full [&>div]:items-stretch [&>div]:space-x-2 [&>div]:space-x-reverse"
        id="operation-tabs"
        large
        selectedTabId={selectedTab}
        onChange={(newTab) => onTabChange(newTab as string)}
      >
        {tabs.length > 0 &&
          joinJSX(
            tabs.map(({ id, name }) => (
              <Tab
                className="flex items-center"
                key={id}
                id={id}
                title={name}
              />
            )),
            <Divider className="self-center h-[1em]" />,
          )}
      </Tabs>
      <div className="grow py-2 flex flex-wrap items-center">
        <span className="grow" />
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
  onSubmit: () => Promise<void> | void
}

const SubmitButton = ({ submitAction, onSubmit }: SubmitButtonProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = async () => {
    if (successTimer.current) {
      clearTimeout(successTimer.current)
      successTimer.current = null
    }
    setSubmitting(true)
    try {
      await onSubmit()
      setSuccess(true)
      successTimer.current = setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <Button
      large
      intent={success ? 'success' : 'primary'}
      className="w-40"
      icon={success ? 'tick' : 'upload'}
      loading={submitting}
      text={submitAction}
      onClick={handleSubmit}
    />
  )
}

const AutoSaveButton = () => {
  const { withCheckpoint } = useEditorControls()
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
                    withCheckpoint(() => {
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
  const { history, canRedo, canUndo } = useEditorHistory()
  const { undo, redo, checkout } = useEditorControls()
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
                        detailTooltip={false}
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
  const globalErrors = useAtomValue(editorGlobalErrorsAtom)
  const entityErrors = useAtomValue(editorEntityErrorsAtom)
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
  const [visible, setVisible] = useAtom(editorErrorsVisibleAtom)
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
