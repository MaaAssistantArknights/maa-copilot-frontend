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
import { useEffect, useRef, useState } from 'react'
import { Control, useFieldArray } from 'react-hook-form'
import { Sortable } from '../../dnd'
import { EditorActionAdd } from './EditorActionAdd'
import { EditorActionItem } from './EditorActionItem'

export interface EditorActionsProps {
  control: Control<CopilotDocV1.Operation>
}

export const EditorActions = ({ control }: EditorActionsProps) => {
  const [activeAction, setActiveAction] = useState<CopilotDocV1.Action>()
  const [editingAction, setEditingAction] = useState<typeof fields[number]>()
  const editingIndex = useRef(-1)

  const { fields, append, update, move, remove } = useFieldArray({
    name: 'actions',
    control,
  })

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = ({ active }: DragEndEvent) => {
    setActiveAction(fields.find((action) => action.id === active.id))
  }

  const handleDragOver = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((el) => el.id === active.id)
      const newIndex = fields.findIndex((el) => el.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
    }
  }

  const handleDragEnd = () => {
    setActiveAction(undefined)
  }

  const onSubmit = (action: CopilotDocV1.Action) => {
    if (editingAction) {
      const index = fields.findIndex((el) => el.id === editingAction.id)
      if (index !== -1) {
        update(index, action)

        // we cannot directly update editingAction using the action because its ID
        // as well as the object reference will be changed. The only thing we can do
        // is keep track of the index and retrieve the action after fields have been
        // updated. Beware: make sure the indices do not change before next rerender,
        // otherwise the index access in useEffect will be wrong.
        editingIndex.current = index
      }
    } else {
      append(action)
    }
  }

  // retrieve the action that's just updated
  useEffect(() => {
    if (editingIndex.current !== -1) {
      setEditingAction(fields[editingIndex.current])
      editingIndex.current = -1
    }
  }, [fields])

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
                        editing={editingAction?.id === field.id}
                        onEdit={() =>
                          setEditingAction(
                            editingAction?.id === field.id ? undefined : field,
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
            {activeAction && <EditorActionItem action={activeAction} />}
          </DragOverlay>
        </DndContext>

        {fields.length === 0 && <NonIdealState title="暂无动作" icon="inbox" />}
      </div>
    </div>
  )
}
