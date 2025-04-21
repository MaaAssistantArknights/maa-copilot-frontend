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
      <div className="flex-1">
        <div className="h-[400px]">
          <LevelMap className="h-full" />
        </div>
      </div>
      <Divider className="m-0" />
      <div className="flex-1 p-4 pr-8 pb-96 overflow-auto">
        <div className="flex items-center">
          <h3 className="text-xl font-bold">动作序列 ({actionAtoms.length})</h3>
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
              <span className="absolute pointer-events-none" ref={locatorRef} />
              添加动作
            </Button>
          )}
        />
      </div>
    </div>
  )
}
