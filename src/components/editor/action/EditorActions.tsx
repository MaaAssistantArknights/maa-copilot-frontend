import { NonIdealState } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { uniqueId, unset } from 'lodash-es'
import { Control, useFieldArray } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { Sortable } from '../../dnd'
import { EditorActionFormProps } from './EditorActionForm'
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
  const { fields, append, insert, update, move, remove } = useFieldArray({
    name: 'actions',
    control,
  })

  // upcast to prevent misuse of `.id`
  const actions: CopilotDocV1.Action[] = fields

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((el) => getId(el) === active.id)
      const newIndex = actions.findIndex((el) => getId(el) === over.id)
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
    }
  }

  const handleDuplicate = (index: number) => {
    const action = JSON.parse(JSON.stringify(actions[index]))
    action._id = uniqueId()
    unset(action, 'id')
    insert(index + 1, action)
  }

  const onSubmit: EditorActionFormProps['onSubmit'] = (action, setError) => {
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
    <div>
      <div className="p-2 -mx-2">
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragEnd}
        >
          <SortableContext
            items={actions.map(getId)}
            strategy={verticalListSortingStrategy}
          >
            {actions.map((action, i) => (
              <Sortable className="mb-2" key={getId(action)} id={getId(action)}>
                {(attrs) => (
                  <EditorActionItem
                    control={control}
                    name={`actions.${i}`}
                    onDuplicate={() => handleDuplicate(i)}
                    onRemove={() => remove(i)}
                    {...attrs}
                  />
                )}
              </Sortable>
            ))}
          </SortableContext>
        </DndContext>

        {actions.length === 0 && (
          <NonIdealState title="暂无动作" className="my-4" icon="inbox" />
        )}
      </div>
    </div>
  )
}
