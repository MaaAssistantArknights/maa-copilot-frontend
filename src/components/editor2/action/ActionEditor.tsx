import { Button, Divider, Icon } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import { FC, useCallback, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { useCurrentSize } from '../../../utils/useCurrenSize'
import { Sortable } from '../../dnd'
import { AtomRenderer } from '../AtomRenderer'
import { editorAtoms, useEdit } from '../editor-state'
import { ActionItem } from './ActionItem'
import { CreateActionMenu, CreateActionMenuRef } from './CreateActionMenu'
import { LevelMap } from './LevelMap'

interface ActionEditorProps {
  className?: string
}

const actionIdsAtom = selectAtom(
  editorAtoms.actions,
  (actions) => actions.map((action) => action.id),
  (a, b) => a.join() === b.join(),
)

export const ActionEditor: FC<ActionEditorProps> = ({ className }) => {
  const { isMD } = useCurrentSize()
  const actionAtoms = useAtomValue(editorAtoms.actionAtoms)
  const actionIds = useAtomValue(actionIdsAtom)
  const edit = useEdit()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  )
  const createActionMenuRef = useRef<CreateActionMenuRef>(null)

  const handleDragEnd = useAtomCallback(
    useCallback(
      (get, set, { active, over }: DragEndEvent) => {
        const actions = get(editorAtoms.actions)
        if (over && active.id !== over.id) {
          const oldIndex = actions.findIndex((el) => el.id === active.id)
          const newIndex = actions.findIndex((el) => el.id === over.id)
          if (oldIndex !== -1 && newIndex !== -1) {
            const actionAtoms = get(editorAtoms.actionAtoms)
            edit(() => {
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
      [edit],
    ),
  )

  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' && e.shiftKey) {
        createActionMenuRef.current?.open(mouseX, mouseY)
        e.preventDefault()
      }
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const rightPanelContent = (
    <>
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
                  <Sortable id={action.id} key={action.id}>
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
      <Button
        minimal
        outlined
        icon={<Icon icon="plus" size={24} />}
        intent="primary"
        className="relative mt-6 w-full h-16 !text-xl"
        onClick={(e) => {
          createActionMenuRef.current?.open(e.clientX, e.clientY)
        }}
      >
        添加动作 (Shift + A)
      </Button>
    </>
  )

  return (
    <div className={clsx('relative grow min-h-0', className)}>
      {isMD ? (
        <div className="p-4 pb-96">{rightPanelContent}</div>
      ) : (
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
          <Panel className="rounded-lg shadow-[inset_0_0_3px_0_rgba(0,0,0,0.2)] !overflow-auto p-4 pb-96">
            {rightPanelContent}
          </Panel>
        </PanelGroup>
      )}
      <CreateActionMenu
        ref={createActionMenuRef}
        renderTarget={({ ref, locatorRef, onClick }) => (
          <div
            className="absolute top-0 right-0 bottom-0 left-0 pointer-events-none"
            ref={ref}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <span className="absolute" ref={locatorRef} onClick={onClick} />
          </div>
        )}
      />
    </div>
  )
}
