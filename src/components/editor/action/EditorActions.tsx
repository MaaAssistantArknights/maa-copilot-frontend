import {
  Card,
  Elevation,
  Icon,
  Menu,
  MenuItem,
  NonIdealState,
} from '@blueprintjs/core'
import { ContextMenu2 } from '@blueprintjs/popover2'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FC } from 'react'
import { Control, useFieldArray } from 'react-hook-form'
import { EditorActionAdd } from './EditorActionAdd'

export interface EditorActionsProps {
  control: Control<CopilotDocV1.Operation>
}

export const EditorActions = ({ control }: EditorActionsProps) => {
  const { fields, append, move } = useFieldArray({
    name: 'actions',
    control,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((el) => el.id === active.id)
      const newIndex = fields.findIndex((el) => el.id === over.id)
      if (oldIndex && newIndex) move(oldIndex, newIndex)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <EditorActionAdd append={append} />

      <div className="h-full overflow-auto p-2 -mx-2 relative">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={fields}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <EditorActionItem key={field.id} id={field.id} action={field} />
            ))}
          </SortableContext>
        </DndContext>

        {fields.length === 0 && <NonIdealState title="暂无动作" icon="inbox" />}
      </div>
    </div>
  )
}

export const EditorActionItem: FC<{
  id: UniqueIdentifier
  action: CopilotDocV1.Action
}> = ({ id, action }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      transition: {
        duration: 250, // milliseconds
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <ContextMenu2
      className="mb-2 last:mb-0"
      content={
        <Menu>
          <MenuItem text="编辑动作" icon="edit" />
          <MenuItem intent="danger" text="删除动作..." icon="delete" />
        </Menu>
      }
    >
      <div style={style} ref={setNodeRef}>
        <Card elevation={Elevation.TWO}>
          <Icon
            className="cursor-grab active:cursor-grabbing py-1 px-0.5 -my-1 -mx-0.5 rounded-[1px]"
            icon="drag-handle-vertical"
            {...attributes}
            {...listeners}
          />
          <span className="ml-4">{action.type}</span>
        </Card>
      </div>
    </ContextMenu2>
  )
}
