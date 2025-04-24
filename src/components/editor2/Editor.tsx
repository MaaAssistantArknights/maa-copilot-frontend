import { Button, Divider } from '@blueprintjs/core'

import clsx from 'clsx'
import { throttle } from 'lodash-es'
import { FC, memo, useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { EditorToolbar } from './EditorToolbar'
import { InfoEditor } from './InfoEditor'
import { ActionEditor } from './action/ActionEditor'
import { useEditorControls } from './editor-state'
import { OperatorEditor } from './operator/OperatorEditor'
import { OperatorSheet } from './operator/sheet/OperatorSheet'
import { useAutosave } from './useAutoSave'

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
    useAutosave()
    const { undo, redo } = useEditorControls()
    const [selectedTab, setSelectedTab] = useState(tabs[0].id)

    useEffect(() => {
      const shouldUseNativeUndo = (e: Event) => {
        return (
          e.target instanceof HTMLElement &&
          e.target.getAttribute('data-use-native-undo')
        )
      }
      const throttledUndo = throttle(undo, 100)
      const throttledRedo = throttle(redo, 100)
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
          if (shouldUseNativeUndo(e)) {
            return
          }
          if (e.shiftKey) {
            throttledRedo()
          } else {
            throttledUndo()
          }
          e.preventDefault()
        }
      }
      const onBeforeInput = (e: InputEvent) => {
        if (shouldUseNativeUndo(e)) {
          return
        }
        if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
          e.preventDefault()
        }
      }
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('beforeinput', onBeforeInput, {
        capture: true,
      })
      return () => {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('beforeinput', onBeforeInput, {
          capture: true,
        })
      }
    }, [undo, redo])

    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
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
        <Button
          intent="primary"
          icon={selectedTab === 'main' ? 'arrow-right' : 'arrow-left'}
          className="fixed bottom-4 right-4 w-12 h-12 !rounded-full"
          onClick={() => {
            setSelectedTab((prev) => (prev === 'main' ? 'action' : 'main'))
          }}
        />
      </div>
    )
  },
)
OperationEditor.displayName = 'OperationEditor'
