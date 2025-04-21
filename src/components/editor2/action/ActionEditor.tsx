import { Button, Divider, Icon } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import { FC, useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Sortable } from '../../dnd'
import { AtomRenderer } from '../AtomRenderer'
import { editorAtoms, useEditorControls } from '../editor-state'
import { getInternalId } from '../reconciliation'
import { ActionItem } from './ActionItem'
import { CreateActionMenu } from './CreateActionMenu'
import { LevelMap } from './LevelMap'

interface ActionEditorProps {
  className?: string
}

const actionIdsAtom = selectAtom(
  editorAtoms.actions,
  (actions) => actions.map(getInternalId),
  (a, b) => a.join() === b.join(),
)

export const ActionEditor: FC<ActionEditorProps> = ({ className }) => {
  const actionAtoms = useAtomValue(editorAtoms.actionAtoms)
  const actionIds = useAtomValue(actionIdsAtom)
  const { withCheckpoint } = useEditorControls()
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useAtomCallback(
    useCallback(
      (get, set, { active, over }: DragEndEvent) => {
        const actions = get(editorAtoms.actions)
        if (over && active.id !== over.id) {
          const oldIndex = actions.findIndex(
            (el) => getInternalId(el) === active.id,
          )
          const newIndex = actions.findIndex(
            (el) => getInternalId(el) === over.id,
          )
          if (oldIndex !== -1 && newIndex !== -1) {
            const actionAtoms = get(editorAtoms.actionAtoms)
            withCheckpoint(() => {
              // 从后往前移动需要+1，比如从 0 移动到 1，最终位置是 1，实际上是 before 2
              const beforeIndex = oldIndex < newIndex ? newIndex + 1 : newIndex
              set(editorAtoms.actionAtoms, {
                type: 'move',
                atom: actionAtoms[oldIndex],
                before: actionAtoms[beforeIndex],
              })
              return {
                action: 'move-action',
                desc: '移动动作',
                squash: false,
              }
            })
          }
        }
      },
      [withCheckpoint],
    ),
  )

  return (
    <div className={clsx('grow min-h-0 flex', className)}>
      <PanelGroup autoSaveId="editor-actions" direction="horizontal">
        <Panel>
          <PanelGroup autoSaveId="editor-actions-left" direction="vertical">
            <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)]">
              <LevelMap className="h-full" />
            </Panel>
            <PanelResizeHandle className="h-1 bg-white dark:bg-[#383e47]" />
            <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)]">
              干员列表（待实现）
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="w-1 bg-white dark:bg-[#383e47]" />
        <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)] !overflow-auto p-4 pr-8 pb-96">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">
              动作序列 ({actionAtoms.length})
            </h3>
            <Divider className="grow" />
          </div>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={actionIds}>
              <ul className="flex flex-col">
                {actionAtoms.map((actionAtom) => (
                  <AtomRenderer
                    key={actionAtom.toString()}
                    atom={actionAtom}
                    render={(action) => (
                      <Sortable
                        id={getInternalId(action)}
                        key={getInternalId(action)}
                      >
                        {(attrs) => (
                          <ActionItem actionAtom={actionAtom} {...attrs} />
                        )}
                      </Sortable>
                    )}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <CreateActionMenu
            renderTarget={({ ref, locatorRef, onClick }) => (
              <Button
                minimal
                outlined
                icon={<Icon icon="plus" size={24} />}
                intent="primary"
                className="relative mt-6 w-full h-16 !text-xl"
                elementRef={ref}
                onClick={onClick}
              >
                <span
                  className="absolute pointer-events-none"
                  ref={locatorRef}
                />
                添加动作
              </Button>
            )}
          />
        </Panel>
      </PanelGroup>
    </div>
  )
}
