import { Card, Elevation, Icon } from '@blueprintjs/core'
import { UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { clsx } from 'clsx'
import { Sortable, SortableItemProps } from '../../dnd'
import { EditorOperatorItem } from './EditorOperatorItem'

export type GroupWithIdentifiedOperators = Omit<CopilotDocV1.Group, 'opers'> & {
  opers: (CopilotDocV1.Operator & { id: UniqueIdentifier })[]
}

interface EditorGroupItemProps extends Partial<SortableItemProps> {
  group: CopilotDocV1.Group
  getOperatorId: (operator: CopilotDocV1.Operator) => UniqueIdentifier
}

export const EditorGroupItem = ({
  group,
  getOperatorId,
  isDragging,
  attributes,
  listeners,
}: EditorGroupItemProps) => {
  return (
    <Card elevation={Elevation.TWO} className={clsx(isDragging && 'invisible')}>
      <SortableContext
        items={group.opers?.map(getOperatorId) || []}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex">
          <Icon
            className="cursor-grab active:cursor-grabbing p-1 -my-1 -ml-2 rounded-[1px]"
            icon="drag-handle-vertical"
            {...attributes}
            {...listeners}
          />

          <h3 className="font-bold leading-none mb-4">{group.name}</h3>
        </div>

        <ul>
          {group.opers?.map((operator) => (
            <li className="mb-2" key={getOperatorId(operator)}>
              <Sortable
                id={getOperatorId(operator)}
                data={{ type: 'operator' }}
              >
                {(attrs) => (
                  <EditorOperatorItem operator={operator} {...attrs} />
                )}
              </Sortable>
            </li>
          ))}
        </ul>
      </SortableContext>
    </Card>
  )
}
