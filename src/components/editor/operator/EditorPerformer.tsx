import { NonIdealState } from '@blueprintjs/core'
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  Over,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arraySwap,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FC, useState } from 'react'
import { Control, useFieldArray, UseFieldArrayMove } from 'react-hook-form'
import { SetRequired } from 'type-fest'
import { FieldError } from '../../../utils/fieldError'
import { Droppable, Sortable } from '../../dnd'
import { FactItem } from '../../FactItem'
import { EditorGroupItem } from './EditorGroupItem'
import { EditorOperatorItem } from './EditorOperatorItem'
import {
  EditorPerformerAdd,
  EditorPerformerAddProps,
} from './EditorPerformerAdd'

const nonGroupedContainerId = 'nonGrouped'

// use .name as ID instead of .id because .id may not exist in operators inside group.opers
const getOperatorId = (operator: CopilotDocV1.Operator) => operator.name

// add a prefix to prevent ID collision, not really necessary because we already got data.type,
// but just in case
const getGroupId = (group: CopilotDocV1.Group) => 'group:' + group.name

export const EditorPerformer: FC<{
  control: Control<CopilotDocV1.Operation>
}> = ({ control }) => {
  const sensors = useSensors(useSensor(PointerSensor))

  const {
    fields: operators,
    append: appendOperator,
    move: moveOperator,
    remove: removeOperator,
  } = useFieldArray({
    name: 'opers',
    control,
  })

  const {
    fields: groups,
    append: appendGroup,
    move: moveGroup,
    update: updateGroup,
  } = useFieldArray({
    name: 'groups',
    control,
  })

  const [activeOperator, setActiveOperator] = useState<CopilotDocV1.Operator>()
  const [activeGroup, setActiveGroup] = useState<CopilotDocV1.Group>()

  const findOperatorById = (id: UniqueIdentifier) =>
    // find operator from operators
    operators.find((op) => getOperatorId(op) === id) ||
    // find operator from inside groups
    (groups
      .map(({ opers }) => opers)
      .flat()
      .find((op) => op && getOperatorId(op) === id) as
      | typeof operators[number]
      | undefined)

  const findGroupById = (id: UniqueIdentifier) =>
    groups.find((group) => getGroupId(group) === id)

  const findGroupByOperator = (operator?: CopilotDocV1.Operator) =>
    operator &&
    (groups.find((group) => group.opers?.includes(operator)) as
      | SetRequired<typeof groups[number], 'opers'>
      | undefined)

  const getType = (item: Active | Over) =>
    item.data.current?.type as 'operator' | 'group'

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (getType(active) === 'operator') {
      setActiveOperator(findOperatorById(active.id))
    } else {
      setActiveGroup(findGroupById(active.id))
    }
  }

  const handleDragOver = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    // move operator between groups, or make it non-grouped
    if (getType(active) === 'operator') {
      const operator = findOperatorById(active.id)

      if (operator) {
        const oldGroup = findGroupByOperator(operator)
        const newGroup =
          getType(over) === 'group'
            ? findGroupById(over.id)
            : findGroupByOperator(findOperatorById(over.id))

        if (oldGroup !== newGroup) {
          if (oldGroup) {
            updateGroup(groups.indexOf(oldGroup), {
              ...oldGroup,
              opers: oldGroup.opers?.filter(
                ({ name }) => name !== operator.name,
              ),
            })
          } else {
            removeOperator(operators.indexOf(operator))
          }

          if (newGroup) {
            updateGroup(groups.indexOf(newGroup), {
              ...newGroup,
              opers: [operator, ...(newGroup.opers || [])],
            })
          } else {
            appendOperator(operator)
          }
        }
      }
    }

    // move item
    if (getType(active) === getType(over)) {
      const moveItem = <T extends CopilotDocV1.Operator | CopilotDocV1.Group>(
        items: T[],
        getId: (item: T) => UniqueIdentifier,
        move: UseFieldArrayMove,
      ) => {
        const oldIndex = items.findIndex((item) => getId(item) === active.id)
        const newIndex = items.findIndex((item) => getId(item) === over.id)
        if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
      }

      if (getType(active) === 'operator') {
        const operator = findOperatorById(active.id)

        if (operator) {
          const group = findGroupByOperator(operator)

          if (group) {
            moveItem(group.opers, getOperatorId, (oldIndex, newIndex) => {
              updateGroup(groups.indexOf(group), {
                ...group,
                opers: arraySwap(group.opers, oldIndex, newIndex),
              })
            })
          } else {
            moveItem(operators, getOperatorId, moveOperator)
          }
        }
      } else if (getType(active) === 'group') {
        moveItem(groups, getGroupId, moveGroup)
      }
    }
  }

  const handleDragEnd = () => {
    setActiveOperator(undefined)
    setActiveGroup(undefined)
  }

  const submitOperator: EditorPerformerAddProps['submitOperator'] = (
    operator,
  ) => {
    if (findOperatorById(getOperatorId(operator))) {
      throw new FieldError('name', '该干员已存在')
    }

    appendOperator(operator)
  }

  const submitGroup: EditorPerformerAddProps['submitGroup'] = (group) => {
    if (findGroupById(getGroupId(group))) {
      throw new FieldError('name', '该干员组已存在')
    }

    appendGroup(group)
  }

  return (
    <>
      <EditorPerformerAdd
        submitOperator={submitOperator}
        submitGroup={submitGroup}
      />
      <div className="p-2 -mx-2 relative">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Droppable id={nonGroupedContainerId}>
            <FactItem
              title="干员"
              icon="person"
              className="font-bold"
            ></FactItem>

            {operators.length === 0 && <NonIdealState title="暂无干员" />}

            <SortableContext
              items={operators.map(getOperatorId)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {operators.map((operator) => (
                  <li className="mt-2" key={getOperatorId(operator)}>
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
          </Droppable>

          <FactItem
            title="干员组"
            icon="people"
            className="font-bold mt-8"
          ></FactItem>

          {groups.length === 0 && <NonIdealState title="暂无干员组" />}

          <SortableContext
            items={groups.map(getGroupId)}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {groups.map((group) => (
                <li className="mt-2" key={getGroupId(group)}>
                  <Sortable id={getGroupId(group)} data={{ type: 'group' }}>
                    {(attrs) => (
                      <EditorGroupItem
                        group={group}
                        getOperatorId={getOperatorId}
                        {...attrs}
                      />
                    )}
                  </Sortable>
                </li>
              ))}
            </ul>
          </SortableContext>

          <DragOverlay>
            {activeOperator && <EditorOperatorItem operator={activeOperator} />}
            {activeGroup && (
              <EditorGroupItem
                group={activeGroup}
                getOperatorId={getOperatorId}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}
