import { Button, Divider, H1, Icon, Navbar, Tab, Tabs } from '@blueprintjs/core'

import { FC, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'

import { SourceEditorButton } from '../editor/source/SourceEditorButton'
import {
  EditorFormValues,
  editorStateAtom,
  useAtomHistory,
} from './editor-state'

interface EditorToolbarProps {
  title?: string
  tabs: { id: string; name: string }[]
  selectedTab: string
  onTabChange: (id: string) => void
  submitAction: string
  onSubmit: () => void
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  submitAction,
  onSubmit,
}) => {
  const form = useFormContext<EditorFormValues>()
  const {
    formState: { isSubmitting },
  } = form
  const { history, canRedo, canUndo, undo, redo } =
    useAtomHistory(editorStateAtom)

  return (
    <Navbar className="px-8 h-auto flex items-baseline flex-wrap w-full">
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
          tabs
            .map(({ id, name }) => (
              <Tab
                className="flex items-center"
                key={id}
                id={id}
                title={name}
              />
            ))
            .reduce(
              (prev, curr) =>
                prev.length === 0
                  ? [curr]
                  : [
                      ...prev,
                      <Divider
                        key={'divider' + prev.length}
                        className="self-center h-[1em]"
                      />,
                      curr,
                    ],
              [] as ReactNode[],
            )}
      </Tabs>
      <div className="ml-auto py-2 flex items-center gap-2">
        <SourceEditorButton
          className="ml-4"
          form={form}
          triggerValidation={() => {}}
        />
        <Button
          minimal
          text={history.index + 1 + '/' + history.stack.length}
          disabled
        />
        <Button
          minimal
          icon="undo"
          title="撤销"
          disabled={!canUndo}
          onClick={undo}
        />
        <Button
          minimal
          className="mr-8"
          icon="redo"
          title="重做"
          disabled={!canRedo}
          onClick={redo}
        />
        <Button
          large
          intent="primary"
          className="!px-8"
          icon="upload"
          text={submitAction}
          loading={isSubmitting}
          onClick={onSubmit}
        />
      </div>
    </Navbar>
  )
}
