import { Divider } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, memo, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { EditorToolbar } from './EditorToolbar'
import { InfoEditor } from './InfoEditor'
import { ActionEditor } from './action/ActionEditor'
import { OperatorEditor } from './operator/OperatorEditor'
import { OperatorSheet } from './operator/sheet/OperatorSheet'

interface OperationEditorProps {
  title?: string
  submitAction: string
  onSubmit: () => void
}

const tabs = [
  { id: 'main', name: '作业信息' },
  { id: 'action', name: '动作序列' },
]

export const OperationEditor: FC<OperationEditorProps> = memo(
  ({ title, submitAction, onSubmit }) => {
    const [selectedTab, setSelectedTab] = useState(tabs[0].id)

    return (
      <div className="copilot-editor h-[calc(100vh-3.5rem)] flex flex-col">
        <EditorToolbar
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          title={title}
          submitAction={submitAction}
          onSubmit={onSubmit}
        />

        <div
          className={clsx(
            'grow min-h-0 flex',
            selectedTab !== 'main' && 'hidden',
          )}
        >
          <PanelGroup autoSaveId="editor-main" direction="horizontal">
            <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)]">
              <OperatorSheet />
            </Panel>
            <PanelResizeHandle className="w-1 bg-white dark:bg-[#383e47]" />
            <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)] !overflow-auto">
              <div className="p-4 pr-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold">作业信息</h2>
                  <Divider className="grow" />
                </div>
                <InfoEditor className="mb-4 [&>.bp4-inline>.bp4-label]:w-20" />
                <OperatorEditor />
              </div>
            </Panel>
          </PanelGroup>
        </div>
        <ActionEditor className={clsx(selectedTab !== 'action' && 'hidden')} />
      </div>
    )
  },
)
OperationEditor.displayName = 'OperationEditor'
