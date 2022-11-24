import { Icon, NonIdealState } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'
import {
  Active,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Over,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { uniqueId } from 'lodash-es'
import { FC, useState } from 'react'
import { Control, UseFieldArrayMove, useFieldArray } from 'react-hook-form'
import { SetRequired } from 'type-fest'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { FactItem } from '../../FactItem'
import { Sortable } from '../../dnd'
import { EditorGroupItem } from './EditorGroupItem'
import { EditorOperatorItem } from './EditorOperatorItem'
import { EditorPerformerAddProps, PerformerType } from './EditorPerformerAdd'

export interface EditorPerformerProps {
  control: Control<CopilotDocV1.Operation>
}

type Operator = CopilotDocV1.Operator
type Group = CopilotDocV1.Group

const getId = (performer: Operator | Group) => {
  // normally the id will never be undefined, but we need to make TS happy as well as handing edge cases
  return (performer._id ??= uniqueId())
}

export const EditorPerformer: FC<EditorPerformerProps> = ({ control }) => {
  const [editMode, setEditMode] = useState<PerformerType>('operator')
  const sensors = useSensors(useSensor(PointerSensor))

  const {
    fields: _operators,
    insert: insertOperator,
    move: moveOperator,
    update: updateOperator,
    remove: removeOperator,
  } = useFieldArray({
    name: 'opers',
    control,
  })

  const {
    fields: _groups,
    insert: insertGroup,
    move: moveGroup,
    update: updateGroup,
    remove: removeGroup,
  } = useFieldArray({
    name: 'groups',
    control,
  })

  // upcast them to the base types to stop TS from complaining when calling indexOf(), includes(), etc.
  const operators: Operator[] = _operators
  const groups: Group[] = _groups

  const findOperatorById = (id?: UniqueIdentifier) =>
    operators.find((op) => getId(op) === id)

  const findGroupById = (id?: UniqueIdentifier) =>
    groups.find((group) => getId(group) === id)

  const findGroupByOperator = (operator?: Operator) =>
    operator &&
    (groups.find((group) => group.opers?.includes(operator)) as
      | SetRequired<Group, 'opers'>
      | undefined)

  const getType = (item: Active | Over) =>
    item.data.current?.type as 'operator' | 'group'

  const handleDragStart = ({ active }: DragStartEvent) => {}

  const handleDragOver = ({ active, over }: DragEndEvent) => {}

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    console.log(active, over)

    return

    // move operator or group within their own container
    if (getType(active) === getType(over)) {
      const moveItem = <T extends Group | Operator>(
        items: T[],
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
            moveItem(group.opers, (oldIndex, newIndex) => {
              updateGroup(groups.indexOf(group), {
                ...group,
                opers: arrayMove(group.opers, oldIndex, newIndex),
              })
            })
          } else {
            moveItem(operators, moveOperator)
          }
        }
      } else if (getType(active) === 'group') {
        moveItem(groups, moveGroup)
      }
    }
  }

  const submitOperator: EditorPerformerAddProps['submitOperator'] = (
    operator,
    setError,
  ) => {
    const groupName = undefined
    if (
      operators.find(
        ({ _id, name }) => name === operator.name && _id !== operator._id,
      )
    ) {
      setError('name', { message: '干员已存在' })
      return false
    }

    let newGroup: Group | undefined
    let newGroupIndex = -1

    if (groupName) {
      newGroupIndex = groups.findIndex((group) => group.name === groupName)
      newGroup = groups[newGroupIndex]

      if (!newGroup) {
        newGroup = { name: groupName }
        newGroupIndex = groups.length
        submitGroup(newGroup, setError)
      }
    }

    const addOperator = () => {
      if (newGroup) {
        updateGroup(newGroupIndex, {
          ...newGroup,
          opers: [...(newGroup.opers || []), operator],
        })
      } else {
        appendOperator(operator)
      }
    }

    if (editingOperator) {
      const existingOperator = findOperatorById(getId(editingOperator))

      if (existingOperator) {
        operator._id = getId(editingOperator)

        const oldGroup = findGroupByOperator(existingOperator)

        if (oldGroup) {
          if (oldGroup === newGroup) {
            // replace existing operator in group
            updateGroup(groups.indexOf(oldGroup), {
              ...oldGroup,
              opers: oldGroup.opers.map((op) =>
                op === existingOperator ? operator : op,
              ),
            })
          } else {
            // remove existing operator from group
            updateGroup(groups.indexOf(oldGroup), {
              ...oldGroup,
              opers: oldGroup.opers.filter((op) => op !== existingOperator),
            })

            // add new operator to group
            addOperator()
          }
        } else {
          if (newGroup) {
            removeOperator(operators.indexOf(existingOperator))
            addOperator()
          } else {
            updateOperator(operators.indexOf(existingOperator), operator)
          }
        }

        setEditingOperator(undefined)
      } else {
        setError('global' as any, { message: '未能找到要更新的干员' })
        return false
      }
    } else {
      operator._id = uniqueId()
      addOperator()
    }

    return true
  }

  const submitGroup: EditorPerformerAddProps['submitGroup'] = (
    group,
    setError,
  ) => {
    if (
      groups.find(({ _id, name }) => name === group.name && _id !== group._id)
    ) {
      setError('name', { message: '干员组已存在' })
      return false
    }

    if (editingGroup) {
      const existingGroup = findGroupById(getId(editingGroup))

      if (existingGroup) {
        group._id = getId(editingGroup)
        updateGroup(groups.indexOf(existingGroup), group)
        setEditingGroup(undefined)
      } else {
        setError('global' as any, { message: '未能找到要更新的干员组' })
        return false
      }
    } else {
      group._id = uniqueId()
      appendGroup(group)
    }

    return true
  }

  return (
    <>
      <div className="p-2 -mx-2 relative">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragEnd}
        >
          <FactItem
            title={`干员 (${operators.length})`}
            icon="person"
            className="font-bold"
          />
          {operators.length === 0 && <NonIdealState title="暂无干员" />}
          <SortableContext
            items={operators.map(getId)}
            strategy={verticalListSortingStrategy}
          >
            {operators.map((operator, index) => (
              <Sortable
                className="mb-2"
                key={getId(operator)}
                id={getId(operator)}
                data={{ type: 'operator' }}
              >
                {(attrs) => (
                  <EditorOperatorItem
                    control={control}
                    name={`opers.${index}`}
                    onRemove={() => removeOperator(operators.indexOf(operator))}
                    {...attrs}
                  />
                )}
              </Sortable>
            ))}
          </SortableContext>
          <FactItem
            className="font-bold mt-8"
            icon="people"
            title={
              <>
                {`干员组 (${groups.length})`}
                <Tooltip2
                  placement="right"
                  content={
                    <>
                      编队时将选择每个组内练度最高的一位干员，
                      <br />
                      组内的前后顺序不影响判断
                    </>
                  }
                >
                  <Icon icon="help" className="ml-1" />
                </Tooltip2>
              </>
            }
          />
          {groups.length === 0 && (
            // extra div container: NonIdealState is using height: 100% which causes unexpected overflow
            <div className="relative">
              <NonIdealState title="暂无干员组" />
            </div>
          )}

          <SortableContext
            items={groups.map(getId)}
            strategy={verticalListSortingStrategy}
          >
            {groups.map((group, index) => (
              <Sortable
                className="mb-2"
                key={getId(group)}
                id={getId(group)}
                data={{ type: 'group' }}
              >
                {(attrs) => (
                  <EditorGroupItem
                    group={group}
                    onChange={(data) => updateGroup(index, data)}
                    onRemove={() => removeGroup(groups.indexOf(group))}
                    getOperatorId={getId}
                    {...attrs}
                  />
                )}
              </Sortable>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </>
  )
}
