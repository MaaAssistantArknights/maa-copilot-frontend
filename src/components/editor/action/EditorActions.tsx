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
import { Sortable } from '../../dnd'
import { EditorActionAdd } from './EditorActionAdd'
import { EditorActionItem } from './EditorActionItem'

export interface EditorActionsProps {
  control: Control<CopilotDocV1.Operation>
}

export const EditorActions = ({ control }: EditorActionsProps) => {
  const [activeAction, setActiveAction] = useState<CopilotDocV1.Action>()

  const { fields, append, move } = useFieldArray({
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

  return (
    <div>
      <EditorActionAdd append={append} />

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
              {fields.map((field) => (
                <li key={field.id} className="mt-2">
                  <Sortable id={field.id}>
                    {(attrs) => <EditorActionItem action={field} {...attrs} />}
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
