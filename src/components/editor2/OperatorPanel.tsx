import {
  Button,
  Card,
  Classes,
  Elevation,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverlay,
  Over,
  PointerSensor,
  UniqueIdentifier,
  useDndContext,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { clamp, compact, uniqueId } from 'lodash-es'
import { FC } from 'react'
import {
  UseFieldArrayMove,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { SetRequired } from 'type-fest'

import type { CopilotDocV1 } from 'models/copilot.schema'

import {
  OPERATORS,
  adjustOperatorLevel,
  defaultSkills,
  getDefaultRequirements,
  getSkillUsageTitle,
  withDefaultRequirements,
} from '../../models/operator'
import { MasteryIcon } from '../MasteryIcon'
import { Select } from '../Select'
import { Droppable, Sortable, SortableItemProps, useStableArray } from '../dnd'
import { NumericInput2 } from '../editor/NumericInput2'
import { OperatorAvatar } from '../editor/operator/EditorOperator'
import {
  EditorFormValues,
  editorStateAtom,
  useAtomHistory,
} from './editor-state'

type EditorOperator = NonNullable<
  NonNullable<EditorFormValues['opers']>[number]
>
type EditorGroup = NonNullable<NonNullable<EditorFormValues['groups']>[number]>

const getInternalId = (target: { _id?: string }) => {
  return (target._id ??= uniqueId())
}

const nonGroupedContainerId = 'nonGrouped'

export const OperatorPanel: FC = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )
  const { checkpoint } = useAtomHistory(editorStateAtom)
  const { control } = useFormContext<EditorFormValues>()
  const {
    fields: operators,
    append: appendOperator,
    move: moveOperator,
    update: updateOperator,
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
    remove: removeGroup,
  } = useFieldArray({
    name: 'groups',
    control,
  })
  const operatorIds = useStableArray(operators.map(getInternalId))

  const findOperatorById = (id?: UniqueIdentifier) => {
    const operator = operators.find((op) => getInternalId(op) === id)
    if (operator) return { group: undefined, operator }

    for (const group of groups) {
      const operator = group.opers?.find((op) => op && getInternalId(op) === id)
      if (operator)
        return { group: group as SetRequired<typeof group, 'opers'>, operator }
    }
    return { group: undefined, operator: undefined }
  }

  const findGroupById = (id?: UniqueIdentifier) =>
    groups.find((group) => getInternalId(group) === id)

  const getType = (item: Active | Over) =>
    item.data.current?.type as 'operator' | 'group'

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    // move operator between groups, or make it non-grouped
    if (getType(active) === 'operator') {
      const { operator, group: oldGroup } = findOperatorById(active.id)
      if (operator) {
        const newGroup =
          getType(over) === 'group'
            ? findGroupById(over.id)
            : findOperatorById(over.id).group

        if (oldGroup !== newGroup) {
          checkpoint('move-operator', '移动干员', true)
          if (oldGroup) {
            // remove from old group
            updateGroup(groups.indexOf(oldGroup), {
              ...oldGroup,
              opers: oldGroup.opers?.filter((op) => op !== operator),
            })
          } else {
            // remove from global list
            removeOperator(operators.indexOf(operator))
          }
          if (newGroup) {
            // add to new group
            updateGroup(groups.indexOf(newGroup), {
              ...newGroup,
              opers: [operator, ...(newGroup.opers || [])],
            })
          } else {
            // add to global list
            appendOperator(operator)
          }

          return
        }
      }
    }

    // move operator or group within their own container
    if (getType(active) === getType(over)) {
      const moveItem = <T,>(items: T[], move: UseFieldArrayMove) => {
        const oldIndex = items.findIndex(
          (item) => item && getInternalId(item) === active.id,
        )
        const newIndex = items.findIndex(
          (item) => item && getInternalId(item) === over.id,
        )
        if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
      }

      if (getType(active) === 'operator') {
        const { group, operator } = findOperatorById(active.id)
        if (operator) {
          checkpoint('move-operator', '移动干员', true)
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
        checkpoint('move-group', '移动干员组', true)
        moveItem(groups, moveGroup)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Droppable id={nonGroupedContainerId}>
        {operators.length === 0 && <NonIdealState title="暂无干员" />}

        <SortableContext items={operatorIds}>
          <ul className="flex flex-wrap gap-4">
            {operators.map((operator, index) => (
              <Sortable
                id={getInternalId(operator)}
                key={getInternalId(operator)}
                data={{ type: 'operator' }}
              >
                {(attrs) => (
                  <OperatorItem
                    operator={operator}
                    onChange={(newOperator) =>
                      updateOperator(index, newOperator)
                    }
                    onRemove={() => removeOperator(operators.indexOf(operator))}
                    {...attrs}
                  />
                )}
              </Sortable>
            ))}
          </ul>
        </SortableContext>
        <SortableContext items={groups.map(getInternalId)}>
          <ul className="mt-4 flex flex-wrap gap-2">
            {groups.map((group, index) => (
              <Sortable
                id={getInternalId(group)}
                key={getInternalId(group)}
                data={{ type: 'group' }}
              >
                {(attrs) => (
                  <GroupItem
                    group={group}
                    onChange={(newGroup) => updateGroup(index, newGroup)}
                    onRemove={() => removeGroup(groups.indexOf(group))}
                    onOperatorRemove={(operatorIndexInGroup) => {
                      const groupIndex = groups.indexOf(group)
                      if (operatorIndexInGroup > -1) {
                        group.opers?.splice(operatorIndexInGroup, 1)
                      }
                      updateGroup(groupIndex, group)
                    }}
                    {...attrs}
                  />
                )}
              </Sortable>
            ))}
          </ul>
        </SortableContext>
      </Droppable>
      <OperatorDragOverlay />
    </DndContext>
  )
}

const OperatorDragOverlay = () => {
  const { active } = useDndContext()
  const { control } = useFormContext<EditorFormValues>()
  const { fields: operators } = useFieldArray({
    name: 'opers',
    control,
  })
  const { fields: groups } = useFieldArray({
    name: 'groups',
    control,
  })
  const activeOperator =
    active?.data.current?.type === 'operator'
      ? operators.find((op) => getInternalId(op) === active.id) ||
        groups
          .map(({ opers }) => opers)
          .flat()
          .find((op) => op && getInternalId(op) === active.id)
      : undefined
  const activeGroup =
    active?.data.current?.type === 'group'
      ? groups.find((group) => getInternalId(group) === active.id)
      : undefined
  return (
    <DragOverlay>
      {activeOperator && <OperatorItem onOverlay operator={activeOperator} />}
    </DragOverlay>
  )
}

const skillUsageClasses: Record<CopilotDocV1.SkillUsageType, string> = {
  0: '!text-slate-500 dark:!text-slate-400',
  1: '!text-emerald-500',
  2: '!text-indigo-500',
  3: '!text-rose-500',
}

interface OperatorItemProps extends Partial<SortableItemProps> {
  operator: EditorOperator
  draggable?: boolean
  onOverlay?: boolean
  onChange?: (operator: EditorOperator) => void
  onRemove?: () => void
}

const OperatorItem = ({
  draggable = true,
  operator,
  onChange,
  onRemove,
  onOverlay,
  isOver,
  index = 0,
  activeIndex = 0,
  isDragging,
  isSorting,
  attributes,
  listeners,
}: OperatorItemProps) => {
  const { checkpoint } = useAtomHistory(editorStateAtom)
  const info = OPERATORS.find(({ name }) => name === operator.name)
  const skillUsage =
    '技能' +
    getSkillUsageTitle(
      operator.skillUsage ?? 0,
      operator.skillTimes ?? 1,
    ).replace(/（(\d)次）/, 'x$1')
  const skills = info ? info.skills : defaultSkills
  const requirements = withDefaultRequirements(
    operator.requirements,
    info?.rarity,
  )
  const detailedSkills = skills.map((_, index) => ({
    available: index <= requirements.elite,
    defaultLevel: getDefaultRequirements(info?.rarity).skillLevel,
  }))
  const controlsEnabled = !onOverlay && !isDragging && !isSorting

  return (
    <div
      className={clsx('relative flex items-start', isDragging && 'opacity-30')}
    >
      <div className="relative">
        {info?.prof !== 'TOKEN' && (
          <>
            <div className="absolute z-10 top-2 -left-5 ml-[2px] px-3 py-4 rounded-full bg-[radial-gradient(rgba(0,0,0,0.6)_10%,rgba(0,0,0,0.08)_35%,rgba(0,0,0,0)_50%)] pointer-events-none">
              <Button
                small
                minimal
                className="!p-0 !border-0 pointer-events-auto hover:opacity-80"
                onClick={() => {
                  checkpoint(
                    'update-operator-level-' + getInternalId(operator),
                    '修改干员等级',
                    false,
                  )
                  onChange?.({
                    ...operator,
                    requirements: {
                      ...operator.requirements,
                      elite: (requirements.elite - 1 + 3) % 3,
                    },
                  })
                }}
              >
                <img
                  className="w-8 h-7 object-contain"
                  src={`/assets/icons/elite_${requirements.elite}.png`}
                  alt="精英0"
                />
              </Button>
            </div>
            <div className="absolute z-10 -top-2 -left-2 flex flex-col items-center">
              <NumericInput2
                intOnly
                min={1}
                buttonPosition="none"
                title="使用鼠标滚轮调整等级"
                value={requirements.level}
                inputClassName="!w-9 h-9 !p-0 !leading-9 !rounded-full !border-2 !border-yellow-300 !bg-black/50 text-lg text-white font-semibold text-center !shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                onValueChange={(value) => {
                  checkpoint(
                    'update-operator-level-' + getInternalId(operator),
                    '修改干员等级',
                    false,
                  )
                  onChange?.({
                    ...operator,
                    requirements: {
                      ...operator.requirements,
                      level: value,
                    },
                  })
                }}
                onWheelFocused={(e) => {
                  e.preventDefault()
                  checkpoint(
                    'update-operator-level-' + getInternalId(operator),
                    '修改干员等级',
                    false,
                  )
                  onChange?.({
                    ...operator,
                    requirements: {
                      ...operator.requirements,
                      ...adjustOperatorLevel({
                        rarity: info?.rarity,
                        level: requirements.level,
                        elite: requirements.elite,
                        adjustment: e.deltaY > 0 ? -10 : 10,
                      }),
                    },
                  })
                }}
              />
            </div>
          </>
        )}
        <Popover2
          placement="top"
          content={
            <Menu>
              <MenuItem
                icon="trash"
                text="删除"
                intent="danger"
                onClick={onRemove}
              />
            </Menu>
          }
        >
          <Card
            interactive
            elevation={Elevation.ONE}
            className="relative w-24 p-0 !pt-0 !pb-2 flex flex-col overflow-hidden select-none pointer-events-auto"
            {...attributes}
            {...listeners}
          >
            <OperatorAvatar
              id={info?.id}
              rarity={info?.rarity}
              className="mb-1"
            />
            <h4
              className={clsx(
                'ml-1 leading-5 font-bold whitespace-nowrap pointer-events-none',
                operator.name && operator.name.length >= 7 && 'text-xs',
              )}
            >
              {operator.name}
            </h4>
            {info?.prof && info.prof !== 'TOKEN' && (
              <img
                className="absolute z-10 top-0 right-0 w-5 h-5 p-px bg-gray-600 pointer-events-none"
                src={'/assets/prof-icons/' + info?.prof + '.png'}
                alt=""
              />
            )}
          </Card>
        </Popover2>
        <div className="flex h-6">
          {controlsEnabled && (
            <Button
              small
              minimal
              className={clsx(
                '!px-0 !min-h-0 !border-none !text-xs !leading-3 !font-normal',
                skillUsageClasses[operator.skillUsage ?? 0],
              )}
            >
              {skillUsage}
            </Button>
          )}
        </div>
      </div>

      <ul className="w-8 grid grid-rows-4 gap-1 ml-1 mt-1">
        {controlsEnabled &&
          detailedSkills.map(({ defaultLevel, available }, index) => {
            const skillNumber = index + 1
            const selected = operator.skill === skillNumber
            const skillLevel = selected ? requirements.skillLevel : defaultLevel
            return (
              <li
                key={index}
                className={clsx(
                  'relative',
                  selected
                    ? '!bg-blue-100 dark:!bg-blue-900 dark:text-blue-200 text-blue-800'
                    : '!bg-gray-300 dark:!bg-gray-600 opacity-15 dark:opacity-25 hover:opacity-30 dark:hover:opacity-50',
                )}
              >
                <NumericInput2
                  intOnly
                  title={
                    available
                      ? selected
                        ? '选中后使用鼠标滚轮调整技能等级'
                        : skillNumber + '技能'
                      : '当前等级未解锁该技能'
                  }
                  min={0}
                  buttonPosition="none"
                  value={skillLevel <= 7 ? skillLevel : ''} // 大于 7 级时置空然后用 padding 占位，以留出空间在上面放置专精图标
                  inputClassName={clsx(
                    '!w-8 h-8 !p-0 !leading-8 !bg-transparent text-center font-bold text-xl !rounded-none !border-2 !border-current cursor-pointer focus:cursor-text',
                    skillLevel > 7 && '!pl-4',
                  )}
                  onClick={() => {
                    checkpoint('update-operator-skill', '修改干员技能', true)
                    onChange?.({ ...operator, skill: skillNumber })
                  }}
                  onValueChange={(value) => {
                    checkpoint(
                      'update-operator-level-' + getInternalId(operator),
                      '修改技能等级',
                      false,
                    )
                    // 拿到新输入的一位数字（比如原来是 5，输入 2，变成 52，这里会拿到 2）
                    const acceptedValue =
                      value >= 10
                        ? +String(value).replace(
                            String(requirements.skillLevel),
                            '',
                          )
                        : value
                    let newLevel = clamp(acceptedValue, 0, 9)
                    if (newLevel === 0) {
                      newLevel = 10
                    }
                    onChange?.({
                      ...operator,
                      requirements: {
                        ...operator.requirements,
                        skillLevel: newLevel,
                      },
                    })
                  }}
                  onWheelFocused={(e) => {
                    e.preventDefault()
                    checkpoint(
                      'update-operator-level-' + getInternalId(operator),
                      '修改技能等级',
                      false,
                    )
                    onChange?.({
                      ...operator,
                      requirements: {
                        ...operator.requirements,
                        skillLevel: clamp(
                          requirements.skillLevel + (e.deltaY > 0 ? -1 : 1),
                          1,
                          10,
                        ),
                      },
                    })
                  }}
                />
                {skillLevel > 7 && (
                  <MasteryIcon
                    className="absolute top-0 bottom-0 left-0 right-0 p-2 pointer-events-none [&_.sub-circle]:fill-gray-300 dark:[&_.sub-circle]:fill-gray-500"
                    mastery={skillLevel - 7}
                  />
                )}
                {!available && (
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-current rotate-45 -translate-y-px pointer-events-none" />
                )}
              </li>
            )
          })}
        {controlsEnabled && info?.equips && (
          <Select
            className="row-start-4"
            filterable={false}
            items={info.equips}
            itemRenderer={(
              item,
              { index, handleClick, handleFocus, modifiers },
            ) => (
              <MenuItem
                roleStructure="listoption"
                key={item}
                className={clsx(
                  'min-w-12 !rounded-none text-base font-serif font-bold text-center text-slate-600 dark:text-slate-300',
                  modifiers.active && Classes.ACTIVE,
                )}
                text={item || <Icon icon="disable" />}
                onClick={handleClick}
                onFocus={handleFocus}
                selected={index === requirements.module}
              />
            )}
            onItemSelect={(item) => {
              checkpoint('update-operator-skill', '修改干员模组', true)
              onChange?.({
                ...operator,
                requirements: {
                  ...operator.requirements,
                  module: info.equips.indexOf(item),
                },
              })
            }}
            popoverProps={{
              placement: 'top',
              popoverClassName:
                '!rounded-none [&_.bp4-popover2-content]:!p-0 [&_.bp4-menu]:min-w-0 [&_li]:!mb-0',
            }}
          >
            <Button
              small
              minimal
              title="模组"
              className={clsx(
                'w-4 h-4 !p-0 flex items-center justify-center font-serif !font-bold !text-base !rounded-none !border-2 !border-current',
                requirements.module
                  ? '!bg-blue-100 dark:!bg-blue-900 dark:!text-blue-200 !text-blue-800'
                  : '!bg-gray-300 dark:!bg-gray-600 opacity-15 dark:opacity-25 hover:opacity-30 dark:hover:opacity-50',
              )}
            >
              {info.equips[requirements.module]}
            </Button>
          </Select>
        )}
      </ul>
      {isOver && !isDragging && (
        <div
          className={clsx(
            'absolute top-0 w-0.5 h-32 bg-blue-500',
            index > activeIndex ? '-right-1' : '-left-3',
          )}
        />
      )}
    </div>
  )
}

interface GroupItemProps extends Partial<SortableItemProps> {
  group: EditorGroup
  onChange?: (group: EditorGroup) => void
  onRemove?: () => void
  onOperatorRemove?: (index: number) => void
}

const GroupItem = ({
  group,
  onChange,
  onRemove,
  onOperatorRemove,
  isDragging,
  attributes,
  listeners,
}: GroupItemProps) => {
  const { checkpoint } = useAtomHistory(editorStateAtom)
  const operators = compact(group.opers ?? [])
  const operatorIds = useStableArray(operators.map(getInternalId))
  return (
    <SortableContext items={operatorIds}>
      <Card elevation={Elevation.ONE} className="!p-0">
        <InputGroup
          inputClassName="!bg-transparent !border-0 !shadow-none font-bold text-gray-800"
          value={group.name}
          onChange={(e) => {
            checkpoint(
              'update-group-name-' + getInternalId(group),
              '修改干员组名称',
              false,
            )
            onChange?.({ ...group, name: e.target.value })
          }}
        />
        <ul className="px-4 py-2 flex flex-wrap gap-4">
          {operators.map((operator) => (
            <Sortable
              id={getInternalId(operator)}
              key={getInternalId(operator)}
              data={{ type: 'operator' }}
            >
              {(attrs) => <OperatorItem operator={operator} {...attrs} />}
            </Sortable>
          ))}
        </ul>
        {operators.length === 0 && (
          <span className="text-zinc-500">无干员</span>
        )}
      </Card>
    </SortableContext>
  )
}
