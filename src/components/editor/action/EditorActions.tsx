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

import { useState } from 'react'
import { Control, useFieldArray } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { useEditableFields } from '../../../utils/useEditableFields'
import { Sortable } from '../../dnd'
import { EditorActionAdd } from './EditorActionAdd'
import { EditorActionItem } from './EditorActionItem'

export interface EditorActionsProps {
  control: Control<CopilotDocV1.Operation>
}

export const EditorActions = ({ control }: EditorActionsProps) => {
  const [draggingAction, setDraggingAction] = useState<typeof fields[number]>()

  const { fields, append, update, move, remove } = useFieldArray({
    name: 'actions',
    control,
  })

  const {
    editingField: editingAction,
    setEditingField: setEditingAction,
    reserveEditingField: reserveEditingAction,
  } = useEditableFields(fields)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = ({ active }: DragEndEvent) => {
    setDraggingAction(fields.find((action) => action.id === active.id))
  }

  const handleDragOver = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((el) => el.id === active.id)
      const newIndex = fields.findIndex((el) => el.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
    }
  }

  const handleDragEnd = () => {
    setDraggingAction(undefined)
  }

  const onSubmit = (action: CopilotDocV1.Action) => {
    if (editingAction) {
      const index = fields.indexOf(editingAction)
      if (index !== -1) {
        update(index, action)
        reserveEditingAction(index)
      }
    } else {
      append(action)
    }
  }

  return (
    <div>
      <EditorActionAdd
        action={editingAction}
        onSubmit={onSubmit}
        onCancel={() => setEditingAction(undefined)}
      />

      <div className="p-2 -mx-2">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragEnd}
        >
          <SortableContext
            items={fields}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {fields.map((field, i) => (
                <li key={field.id} className="mt-2">
                  <Sortable id={field.id}>
                    {(attrs) => (
                      <EditorActionItem
                        action={field}
                        editing={editingAction === field}
                        onEdit={() =>
                          setEditingAction(
                            editingAction === field ? undefined : field,
                          )
                        }
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
                editing={editingAction === draggingAction}
                action={draggingAction}
              />
            )}
          </DragOverlay>
        </DndContext>

        {fields.length === 0 && (
          <NonIdealState title="暂无动作" className="my-4" icon="inbox" />
        )}
      </div>
    </div>
  )
}
