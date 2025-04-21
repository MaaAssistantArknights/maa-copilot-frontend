import {
  Button,
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
import { FC, useState } from 'react'

import { joinJSX } from '../../utils/react'
import { RelativeTime } from '../RelativeTime'
import { useEditorControls, useEditorHistory } from './editor-state'

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
  const { history, canRedo, canUndo } = useEditorHistory()
  const { undo, redo, checkout } = useEditorControls()
  const [historyListIsOpen, setHistoryListIsOpen] = useState(false)

  return (
    <div className="px-8 flex items-baseline flex-wrap bg-white dark:bg-[#383e47]">
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
      <div className="ml-auto py-2 flex items-center">
        <Popover2
          content={
            historyListIsOpen ? (
              <Menu>
                <MenuDivider className="pb-2 border-b" title="操作历史" />
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
          onOpening={() => setHistoryListIsOpen(true)}
          onClosed={() => setHistoryListIsOpen(false)}
        >
          <Button
            minimal
            large
            icon="history"
            text={history.index + 1 + '/' + history.stack.length}
          />
        </Popover2>
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
          className="mr-8"
          icon="redo"
          title="重做 (Ctrl+Y)"
          disabled={!canRedo}
          onClick={redo}
        />
        <Button
          large
          intent="primary"
          className="!px-8"
          icon="upload"
          text={submitAction}
          onClick={onSubmit}
        />
      </div>
    </div>
  )
}
