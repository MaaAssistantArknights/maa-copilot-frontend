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
  useDndContext,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import { clamp } from 'lodash-es'
import { FC, memo, useCallback, useMemo, useState } from 'react'

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
import { AtomRenderer, OnChangeImmer } from './AtomRenderer'
import {
  EditorGroup,
  EditorOperator,
  editorAtoms,
  useEditorControls,
} from './editor-state'
import { createGroup, getInternalId } from './reconciliation'

const globalContainerId = 'global'

const operatorIdsAtom = selectAtom(
  editorAtoms.operators,
  (operators) => operators.map(getInternalId),
  (a, b) => a.join() === b.join(),
)

export const OperatorPanel: FC = memo(() => {
  const operatorIds = useAtomValue(operatorIdsAtom)
  const { withCheckpoint } = useEditorControls()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )
  const [operatorAtoms, dispatchOperators] = useAtom(editorAtoms.operatorAtoms)
  const [groupAtoms, dispatchGroups] = useAtom(editorAtoms.groupAtoms)

  const handleDragEnd = useAtomCallback(
    useCallback(
      (get, set, { active, over }: DragEndEvent) => {
        const getType = (item: Active | Over) =>
          item.data.current?.type as 'operator' | 'group'

        if (!over || active.id === over.id || getType(active) !== 'operator') {
          return
        }
        const operation = get(editorAtoms.operation)
        const newOperation = produce(operation, (draft) => {
          const locateOperator = (
            target: Active | Over,
          ): {
            container?: { opers: EditorOperator[] }
            index: number
          } => {
            if (getType(target) === 'operator') {
              for (const [index, operator] of draft.opers.entries()) {
                if (getInternalId(operator) === target.id)
                  return { container: draft, index }
              }
              for (const group of draft.groups) {
                for (const [index, operator] of group.opers.entries()) {
                  if (getInternalId(operator) === target.id)
                    return { container: group, index }
                }
              }
            } else {
              if (target.id === globalContainerId) {
                return { container: draft, index: -1 }
              }
              for (const group of draft.groups) {
                if (getInternalId(group) === target.id)
                  return { container: group, index: -1 }
              }
            }
            return { index: -1 }
          }

          const { container: activeContainer, index: activeIndex } =
            locateOperator(active)
          const { container: overContainer, index: overIndex } =
            locateOperator(over)
          if (!activeContainer || !overContainer || activeIndex === -1) return

          // 移除拖拽中的干员
          const activeOperator = activeContainer.opers.splice(activeIndex, 1)[0]

          let insertionIndex = overIndex
          if (overIndex === -1) {
            insertionIndex = overContainer.opers.length
          } else if (activeContainer !== overContainer) {
            // 不在同一个容器时无法触发排序动画，需要手动计算插入在 over 的左边还是右边
            if (active.rect.current.translated) {
              const activeCenter =
                active.rect.current.translated.left +
                active.rect.current.translated.width / 2
              const overCenter = over.rect.left + over.rect.width / 2
              if (activeCenter > overCenter) {
                console.log(insertionIndex, '->', insertionIndex - 1)
                insertionIndex += 1
              }
            }
          }

          // 插入到新的位置
          overContainer.opers.splice(insertionIndex, 0, activeOperator)
        })

        if (newOperation !== operation) {
          withCheckpoint(() => {
            set(editorAtoms.operation, newOperation)
            return {
              action: 'move-operator',
              desc: '移动干员',
              squash: false,
            }
          })
        }
      },
      [withCheckpoint],
    ),
  )

  return (
    <div className="pb-96">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {operatorAtoms.length === 0 && <NonIdealState title="暂无干员" />}
        <Droppable id={globalContainerId} data={{ type: 'group' }}>
          <SortableContext items={operatorIds}>
            <ul className="flex flex-wrap gap-4">
              {operatorAtoms.map((operatorAtom) => (
                <AtomRenderer
                  atom={operatorAtom}
                  key={operatorAtom.toString()}
                  render={(operator, { onChange }) => (
                    <Sortable
                      id={getInternalId(operator)}
                      data={{
                        type: 'operator',
                        container: globalContainerId,
                      }}
                    >
                      {(attrs) => (
                        <OperatorItem
                          operator={operator}
                          onChange={onChange}
                          onRemove={() =>
                            withCheckpoint(() => {
                              dispatchOperators({
                                type: 'remove',
                                atom: operatorAtom,
                              })
                              return {
                                action: 'remove-operator',
                                desc: '移除干员',
                                squash: false,
                              }
                            })
                          }
                          {...attrs}
                        />
                      )}
                    </Sortable>
                  )}
                />
              ))}
            </ul>
          </SortableContext>
        </Droppable>
        <ul className="mt-4 flex flex-wrap gap-2">
          {groupAtoms.map((groupAtom) => (
            <AtomRenderer
              atom={groupAtom}
              key={groupAtom.toString()}
              render={(group, { onChange }) => (
                <GroupItem
                  group={group}
                  onChange={onChange}
                  onRemove={() => {
                    withCheckpoint(() => {
                      dispatchGroups({
                        type: 'remove',
                        atom: groupAtom,
                      })
                      return {
                        action: 'remove-group',
                        desc: '移除干员组',
                        squash: false,
                      }
                    })
                  }}
                />
              )}
            />
          ))}
        </ul>
        <CreateGroupButton />
        <OperatorDragOverlay />
      </DndContext>
    </div>
  )
})
OperatorPanel.displayName = 'OperatorPanel'

const CreateGroupButton: FC<{}> = () => {
  const [groupAtoms, dispatchGroups] = useAtom(editorAtoms.groupAtoms)
  const { withCheckpoint } = useEditorControls()
  return (
    <Button
      minimal
      intent="primary"
      className="mt-4 -ml-2 !p-2 !text-base"
      icon="plus"
      onClick={() => {
        withCheckpoint(() => {
          dispatchGroups({
            type: 'insert',
            value: createGroup({ name: '干员组' + (groupAtoms.length + 1) }),
          })
          return {
            action: 'add-group',
            desc: '添加干员组',
            squash: false,
          }
        })
      }}
    >
      添加干员组
    </Button>
  )
}

const OperatorDragOverlay = () => {
  const { active } = useDndContext()
  const activeOperatorAtom = useMemo(
    () =>
      atom((get) => {
        if (active?.id) {
          for (const op of get(editorAtoms.operators)) {
            if (getInternalId(op) === active.id) {
              return op
            }
          }
          for (const group of get(editorAtoms.groups)) {
            for (const op of group.opers) {
              if (getInternalId(op) === active.id) {
                return op
              }
            }
          }
        }
        return undefined
      }),
    [active?.id],
  )
  const activeOperator = useAtomValue(activeOperatorAtom)
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
  onOverlay?: boolean
  onChange?: (operator: EditorOperator) => void
  onRemove?: () => void
}

const OperatorItem: FC<OperatorItemProps> = memo(
  ({
    operator,
    onChange,
    onRemove,
    onOverlay,
    isDragging,
    isSorting,
    attributes,
    listeners,
  }) => {
    const { withCheckpoint } = useEditorControls()
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
        className={clsx('relative flex items-start', isDragging && 'invisible')}
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
                    withCheckpoint(() => {
                      onChange?.({
                        ...operator,
                        requirements: {
                          ...operator.requirements,
                          elite: (requirements.elite - 1 + 3) % 3,
                        },
                      })
                      return {
                        action: 'set-operator-level-' + getInternalId(operator),
                        desc: '修改干员等级',
                        squash: true,
                      }
                    })
                  }}
                >
                  <img
                    className="w-8 h-7 object-contain"
                    src={`/assets/icons/elite_${requirements.elite}.png`}
                    alt={'精英' + requirements.elite}
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
                    withCheckpoint(() => {
                      onChange?.({
                        ...operator,
                        requirements: {
                          ...operator.requirements,
                          level: value,
                        },
                      })
                      return {
                        action: 'set-operator-level-' + getInternalId(operator),
                        desc: '修改干员等级',
                        squash: true,
                      }
                    })
                  }}
                  onWheelFocused={(e) => {
                    e.preventDefault()
                    withCheckpoint(() => {
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
                      return {
                        action: 'set-operator-level-' + getInternalId(operator),
                        desc: '修改干员等级',
                        squash: true,
                      }
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
                className="mb-1 w-full rounded-b-none"
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
              const skillLevel = selected
                ? requirements.skillLevel
                : defaultLevel
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
                      withCheckpoint(() => {
                        onChange?.({ ...operator, skill: skillNumber })
                        return {
                          action:
                            'set-operator-skill-' + getInternalId(operator),
                          desc: '修改干员技能',
                          squash: false,
                        }
                      })
                    }}
                    onValueChange={(value) => {
                      withCheckpoint(() => {
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
                        return {
                          action:
                            'set-operator-level-' + getInternalId(operator),
                          desc: '修改技能等级',
                          squash: true,
                        }
                      })
                    }}
                    onWheelFocused={(e) => {
                      e.preventDefault()
                      withCheckpoint(() => {
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
                        return {
                          action:
                            'set-operator-level-' + getInternalId(operator),
                          desc: '修改技能等级',
                          squash: true,
                        }
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
                withCheckpoint(() => {
                  onChange?.({
                    ...operator,
                    requirements: {
                      ...operator.requirements,
                      module: info.equips.indexOf(item),
                    },
                  })
                  return {
                    action: 'set-operator-module-' + getInternalId(operator),
                    desc: '修改干员模组',
                    squash: true,
                  }
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
      </div>
    )
  },
)
OperatorItem.displayName = 'OperatorItem'

interface GroupItemProps {
  group: EditorGroup
  onChange?: OnChangeImmer<EditorGroup>
  onMove?: (direction: number) => void
  onRemove?: () => void
}

const GroupItem: FC<GroupItemProps> = memo(
  ({ group, onChange, onMove, onRemove }) => {
    const [operatorAtoms, dispatchOperators] = useAtom(
      editorAtoms.groupOperatorAtoms(getInternalId(group)),
    )
    const operatorIds = useStableArray(group.opers.map(getInternalId))
    const { withCheckpoint } = useEditorControls()
    const [active, setActive] = useState(false)
    return (
      <Card
        elevation={Elevation.ONE}
        className={clsx(
          '!p-0 flex flex-col overflow-hidden',
          active ? 'ring ring-blue-500 !border-0 !shadow-none' : '',
        )}
      >
        <div className="flex items-center">
          <InputGroup
            className="grow"
            inputClassName="!pr-0 !border-0 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600 !shadow-none font-bold text-gray-800"
            size={10}
            value={group.name}
            onChange={(e) => {
              withCheckpoint(() => {
                onChange?.((draft) => {
                  draft.name = e.target.value
                })
                return {
                  action: 'set-group-name-' + getInternalId(group),
                  desc: '修改干员组名称',
                  squash: true,
                }
              })
            }}
          />
          <Popover2
            placement="bottom"
            content={
              <Menu>
                <MenuItem
                  icon="arrow-left"
                  text="左移"
                  onClick={() => {
                    withCheckpoint(() => {
                      onMove?.(-1)
                      return {
                        action: 'move-group',
                        desc: '移动干员组',
                        squash: false,
                      }
                    })
                  }}
                />
                <MenuItem
                  icon="arrow-right"
                  text="右移"
                  onClick={() => {
                    withCheckpoint(() => {
                      onMove?.(1)
                      return {
                        action: 'move-group',
                        desc: '移动干员组',
                        squash: false,
                      }
                    })
                  }}
                />
                <MenuItem
                  icon="trash"
                  text="删除"
                  intent="danger"
                  onClick={() => {
                    withCheckpoint(() => {
                      onRemove?.()
                      return {
                        action: 'remove-group',
                        desc: '移除干员组',
                        squash: false,
                      }
                    })
                  }}
                />
              </Menu>
            }
          >
            <Button
              minimal
              icon={<Icon icon="more" className="rotate-90" />}
              className="!p-0 !border-0"
            />
          </Popover2>
        </div>
        <Droppable
          className="grow px-4 py-2 flex items-center justify-center"
          id={getInternalId(group)}
          data={{ type: 'group' }}
        >
          {group.opers.length === 0 && (
            <div className="text-zinc-500">
              {active ? '请在列表中选择干员' : '请添加干员'}
            </div>
          )}
          <SortableContext items={operatorIds}>
            <ul className="flex flex-wrap gap-4">
              {operatorAtoms.map((operatorAtom) => (
                <AtomRenderer
                  atom={operatorAtom}
                  key={operatorAtom.toString()}
                  render={(operator, { onChange }) => (
                    <Sortable
                      id={getInternalId(operator)}
                      key={getInternalId(operator)}
                      data={{
                        type: 'operator',
                        container: getInternalId(group),
                      }}
                    >
                      {(attrs) => (
                        <OperatorItem
                          operator={operator}
                          onChange={onChange}
                          onRemove={() =>
                            withCheckpoint(() => {
                              dispatchOperators({
                                type: 'remove',
                                atom: operatorAtom,
                              })
                              return {
                                action: 'remove-operator',
                                desc: '移除干员',
                                squash: false,
                              }
                            })
                          }
                          {...attrs}
                        />
                      )}
                    </Sortable>
                  )}
                />
              ))}
            </ul>
          </SortableContext>
        </Droppable>
        <Button
          icon={
            <Icon
              icon={active ? 'tick' : 'aimpoints-target'}
              className="!text-inherit"
            />
          }
          className={clsx(
            'w-full !py-1 !rounded-none !border-0 ',
            active
              ? '!bg-blue-500 hover:!bg-blue-600 dark:!bg-blue-900 !text-white'
              : '!bg-gray-200 hover:!bg-gray-300 dark:!bg-gray-600 dark:hover:!bg-gray-500',
          )}
          onClick={() => {
            setActive((prev) => !prev)
          }}
        >
          {active ? '完成' : '编辑干员'}
        </Button>
      </Card>
    )
  },
)
GroupItem.displayName = 'GroupItem'
