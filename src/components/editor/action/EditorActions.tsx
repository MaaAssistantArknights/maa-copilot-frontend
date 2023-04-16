import { NonIdealState } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { uniqueId, unset } from 'lodash-es'
import { useState } from 'react'
import { Control, useFieldArray } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { Sortable } from '../../dnd'
import { EditorActionAdd, EditorActionAddProps } from './EditorActionAdd'
import { EditorActionItem } from './EditorActionItem'
import { validateAction } from './validation'

export interface EditorActionsProps {
  control: Control<CopilotDocV1.Operation>
}

const getId = (action: CopilotDocV1.Action) => {
  // normally the id will never be undefined, but we need to make TS happy as well as handing edge cases
  return (action._id ??= uniqueId())
}

export const EditorActions = ({ control }: EditorActionsProps) => {
  const [draggingAction, setDraggingAction] = useState<CopilotDocV1.Action>()

  const { fields, append, insert, update, move, remove } = useFieldArray({
    name: 'actions',
    control,
  })

  // upcast to prevent misuse of `.id`
  const actions: CopilotDocV1.Action[] = fields

  const [editingAction, setEditingAction] = useState<CopilotDocV1.Action>()

  const isEditing = (action: CopilotDocV1.Action) =>
    editingAction?._id === action._id

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = ({ active }: DragEndEvent) => {
    setDraggingAction(actions.find((action) => getId(action) === active.id))
  }

  const handleDragOver = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((el) => getId(el) === active.id)
      const newIndex = actions.findIndex((el) => getId(el) === over.id)
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
    }
  }

  const handleDragEnd = () => {
    setDraggingAction(undefined)
  }

  const handleDuplicate = (index: number) => {
    const action = JSON.parse(JSON.stringify(actions[index]))
    action._id = uniqueId()
    unset(action, 'id')
    insert(index + 1, action)
  }

  const onSubmit: EditorActionAddProps['onSubmit'] = (action, setError) => {
    if (!validateAction(action, setError)) {
      return false
    }

    if (editingAction) {
      const index = actions.findIndex((field) => isEditing(field))
      if (index !== -1) {
        action._id = getId(editingAction)
        update(index, action)
        setEditingAction(undefined)
      } else {
        setError('global' as any, { message: '未能找到要更新的动作' })
        return false
      }
    } else {
      action._id = uniqueId()
      append(action)
    }

    return true
  }

  return (
    <div className="flex flex-wrap md:flex-nowrap min-h-[calc(100vh-6rem)]">
      <div className="EditorActionAdd-container w-full md:w-1/2 md:mr-8 flex flex-col pb-8">
        <div className="EditorActionAdd-element">
          <EditorActionAdd
            control={control}
            action={editingAction}
            onSubmit={onSubmit}
            onCancel={() => setEditingAction(undefined)}
            // className="sticky top-0 left-0 w-full md:w-1/3 md:mr-8"
          />
        </div>
      </div>

      <div className="action-list-container p-2 -mx-2 w-full md:w-1/2 pb-8">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragEnd}
        >
          <SortableContext
            items={actions.map(getId)}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {actions.map((action, i) => (
                <li key={getId(action)} className="mt-2">
                  <Sortable id={getId(action)}>
                    {(attrs) => (
                      <EditorActionItem
                        action={action}
                        editing={isEditing(action)}
                        onEdit={() =>
                          setEditingAction(
                            isEditing(action) ? undefined : action,
                          )
                        }
                        onDuplicate={() => handleDuplicate(i)}
                        onRemove={() => remove(i)}
                        {...attrs}
                      />
                    )}
                  </Sortable>
                </li>
              ))}
            </ul>
          </SortableContext>

          <DragOverlay>
            {draggingAction && (
              <EditorActionItem
                editing={isEditing(draggingAction)}
                action={draggingAction}
              />
            )}
          </DragOverlay>
        </DndContext>

        {actions.length === 0 && (
          <NonIdealState title="暂无动作" className="my-4" icon="inbox" />
        )}
      </div>
    </div>
  )
}
