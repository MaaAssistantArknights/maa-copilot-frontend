import { Button, Card, Elevation, Icon, NonIdealState } from '@blueprintjs/core'
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
  removeGroupOperator: (index: number) => void
  removeGroup: () => void
}

export const EditorGroupItem = ({
  group,
  getOperatorId,
  isDragging,
  attributes,
  listeners,
  removeGroupOperator,
  removeGroup,
}: EditorGroupItemProps) => {
  return (
    <Card elevation={Elevation.TWO} className={clsx(isDragging && 'invisible')}>
      <SortableContext
        items={group.opers?.map(getOperatorId) || []}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex items-start mb-2">
          <Icon
            className="cursor-grab active:cursor-grabbing p-1 -mt-1 -ml-2 rounded-[1px]"
            icon="drag-handle-vertical"
            {...attributes}
            {...listeners}
          />

          <h3 className="font-bold leading-none flex-grow">{group.name}</h3>
          <Button
            minimal
            className="-mt-2 -mr-3"
            icon="delete"
            intent="danger"
            onClick={removeGroup}
          />
        </div>

        <ul>
          {group.opers?.map((operator) => (
            <li className="mb-2" key={getOperatorId(operator)}>
              <Sortable
                id={getOperatorId(operator)}
                data={{ type: 'operator' }}
              >
                {(attrs) => (
                  <EditorOperatorItem
                    operator={operator}
                    removeOperator={() => {
                      removeGroupOperator(group.opers?.indexOf(operator) ?? -1)
                    }}
                    {...attrs}
                  />
                )}
              </Sortable>
            </li>
          ))}
        </ul>

        {!group.opers?.length && (
          <NonIdealState>将干员拖拽到此处</NonIdealState>
        )}
      </SortableContext>
    </Card>
  )
}
