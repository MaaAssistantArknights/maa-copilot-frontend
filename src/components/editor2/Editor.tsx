import { Divider } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, memo, useState } from 'react'

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
          <div className="flex-1">
            <OperatorSheet />
          </div>
          <Divider className="m-0" />
          <div className="flex-1 p-4 pr-8 overflow-auto">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold">作业信息</h2>
              <Divider className="grow" />
            </div>
            <InfoEditor className="mb-4 [&>.bp4-inline>.bp4-label]:w-20" />
            <OperatorEditor />
          </div>
        </div>
        <ActionEditor className={clsx(selectedTab !== 'action' && 'hidden')} />
      </div>
    )
  },
)
OperationEditor.displayName = 'OperationEditor'
