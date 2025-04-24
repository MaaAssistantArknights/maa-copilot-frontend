import { Button, Divider } from '@blueprintjs/core'
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverlay,
  Over,
  PointerSensor,
  useDndContext,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import { produce } from 'immer'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import { FC, memo, useCallback, useMemo } from 'react'

import { Droppable, Sortable } from '../../dnd'
import { AtomRenderer } from '../AtomRenderer'
import { EditorOperator, editorAtoms, useEditorControls } from '../editor-state'
import { createGroup, createOperator, getInternalId } from '../reconciliation'
import { GroupItem } from './GroupItem'
import { OperatorItem } from './OperatorItem'
import { OperatorSelect } from './OperatorSelect'
import { useAddOperator } from './useAddOperator'

const globalContainerId = 'global'

const operatorIdsAtom = selectAtom(
  editorAtoms.operators,
  (operators) => operators.map(getInternalId),
  (a, b) => a.join() === b.join(),
)

export const OperatorEditor: FC = memo(() => {
  const operatorIds = useAtomValue(operatorIdsAtom)
  const { withCheckpoint } = useEditorControls()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )
  const [operatorAtoms, dispatchOperators] = useAtom(editorAtoms.operatorAtoms)
  const [baseGroupAtoms] = useAtom(editorAtoms.baseGroupAtoms)

  const handleDragEnd = useAtomCallback(
    useCallback(
      (get, set, { active, over }: DragEndEvent) => {
        const getType = (item: Active | Over) =>
          item.data.current?.type as 'operator' | 'group'

        if (!over || active.id === over.id || getType(active) !== 'operator') {
          return
        }
        const operation = get(editorAtoms.operation)
        const newOperation = produce(operation, (draft) => {
          const locateOperator = (
            target: Active | Over,
          ): {
            container?: { opers: EditorOperator[] }
            index: number
          } => {
            if (getType(target) === 'operator') {
              for (const [index, operator] of draft.opers.entries()) {
                if (getInternalId(operator) === target.id)
                  return { container: draft, index }
              }
              for (const group of draft.groups) {
                for (const [index, operator] of group.opers.entries()) {
                  if (getInternalId(operator) === target.id)
                    return { container: group, index }
                }
              }
            } else {
              if (target.id === globalContainerId) {
                return { container: draft, index: -1 }
              }
              for (const group of draft.groups) {
                if (getInternalId(group) === target.id)
                  return { container: group, index: -1 }
              }
            }
            return { index: -1 }
          }

          const { container: activeContainer, index: activeIndex } =
            locateOperator(active)
          const { container: overContainer, index: overIndex } =
            locateOperator(over)
          if (!activeContainer || !overContainer || activeIndex === -1) return

          // 移除拖拽中的干员
          const activeOperator = activeContainer.opers.splice(activeIndex, 1)[0]

          let insertionIndex = overIndex
          if (overIndex === -1) {
            insertionIndex = overContainer.opers.length
          } else if (activeContainer !== overContainer) {
            // 不在同一个容器时无法触发排序动画，需要手动计算插入在 over 的左边还是右边
            if (active.rect.current.translated) {
              const activeCenter =
                active.rect.current.translated.left +
                active.rect.current.translated.width / 2
              const overCenter = over.rect.left + over.rect.width / 2
              if (activeCenter > overCenter) {
                insertionIndex += 1
              }
            }
          }

          // 插入到新的位置
          overContainer.opers.splice(insertionIndex, 0, activeOperator)
        })

        if (newOperation !== operation) {
          withCheckpoint(() => {
            set(editorAtoms.operation, newOperation)
            return {
              action: 'move-operator',
              desc: '移动干员',
              squash: false,
            }
          })
        }
      },
      [withCheckpoint],
    ),
  )

  return (
    <>
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">
          干员与干员组 ({operatorAtoms.length})
        </h2>
        <Divider className="grow" />
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Droppable id={globalContainerId} data={{ type: 'group' }}>
          <SortableContext items={operatorIds}>
            <ul className="flex flex-wrap gap-4">
              {operatorAtoms.map((operatorAtom) => (
                <AtomRenderer
                  atom={operatorAtom}
                  key={operatorAtom.toString()}
                  render={(operator, { onChange }) => (
                    <Sortable
                      id={getInternalId(operator)}
                      data={{
                        type: 'operator',
                        container: globalContainerId,
                      }}
                    >
                      {(attrs) => (
                        <OperatorItem
                          operator={operator}
                          onChange={onChange}
                          onRemove={() =>
                            withCheckpoint(() => {
                              dispatchOperators({
                                type: 'remove',
                                atom: operatorAtom,
                              })
                              return {
                                action: 'remove-operator',
                                desc: '移除干员',
                                squash: false,
                              }
                            })
                          }
                          {...attrs}
                        />
                      )}
                    </Sortable>
                  )}
                />
              ))}
            </ul>
          </SortableContext>
        </Droppable>
        <ul className="mt-4 flex flex-wrap gap-2">
          {baseGroupAtoms.map((baseGroupAtom) => (
            <GroupItem
              key={baseGroupAtom.toString()}
              baseGroupAtom={baseGroupAtom}
            />
          ))}
        </ul>
        <div className="mt-4 -ml-2 pb-96 flex items-center gap-2">
          <CreateGroupButton />
          <CreateOperatorButton />
        </div>
        <OperatorDragOverlay />
      </DndContext>
    </>
  )
})
OperatorEditor.displayName = 'OperatorPanel'

const CreateOperatorButton: FC<{}> = () => {
  const addOperator = useAddOperator()
  return (
    <OperatorSelect
      markPicked
      onSelect={(name) => {
        addOperator(createOperator({ name }))
      }}
    >
      <Button minimal intent="primary" className="!p-2 !text-base" icon="plus">
        添加干员...
      </Button>
    </OperatorSelect>
  )
}

const CreateGroupButton: FC<{}> = () => {
  const dispatchGroups = useSetAtom(editorAtoms.groupAtoms)
  const setUI = useSetAtom(editorAtoms.ui)
  const { withCheckpoint } = useEditorControls()
  return (
    <Button
      minimal
      intent="primary"
      className="!p-2 !text-base"
      icon="plus"
      onClick={() => {
        const newGroup = createGroup()
        withCheckpoint(() => {
          dispatchGroups({
            type: 'insert',
            value: newGroup,
          })
          return {
            action: 'add-group',
            desc: '添加干员组',
            squash: false,
          }
        })
        setUI((prev) => ({
          ...prev,
          newlyAddedGroupId: getInternalId(newGroup),
        }))
      }}
    >
      添加干员组
    </Button>
  )
}

const OperatorDragOverlay = () => {
  const { active } = useDndContext()
  const activeOperatorAtom = useMemo(
    () =>
      atom((get) => {
        if (active?.id) {
          for (const op of get(editorAtoms.operators)) {
            if (getInternalId(op) === active.id) {
              return op
            }
          }
          for (const group of get(editorAtoms.groups)) {
            for (const op of group.opers) {
              if (getInternalId(op) === active.id) {
                return op
              }
            }
          }
        }
        return undefined
      }),
    [active?.id],
  )
  const activeOperator = useAtomValue(activeOperatorAtom)
  return (
    <DragOverlay>
      {activeOperator && <OperatorItem onOverlay operator={activeOperator} />}
    </DragOverlay>
  )
}
