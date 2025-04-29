import {
  Button,
  Card,
  Classes,
  Elevation,
  Icon,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { clamp } from 'lodash-es'
import { FC, memo } from 'react'

import { CopilotDocV1 } from 'models/copilot.schema'

import {
  OPERATORS,
  adjustOperatorLevel,
  defaultSkills,
  getDefaultRequirements,
  getEliteIconUrl,
  getSkillUsageTitle,
  operatorSkillUsages,
  withDefaultRequirements,
} from '../../../models/operator'
import { MasteryIcon } from '../../MasteryIcon'
import { Select } from '../../Select'
import { SortableItemProps } from '../../dnd'
import { DetailedSelect } from '../../editor/DetailedSelect'
import { NumericInput2 } from '../../editor/NumericInput2'
import { OperatorAvatar } from '../../editor/operator/EditorOperator'
import { EditorOperator, useEditorControls } from '../editor-state'
import { getInternalId } from '../reconciliation'

interface OperatorItemProps extends Partial<SortableItemProps> {
  operator: EditorOperator
  onOverlay?: boolean
  onChange?: (operator: EditorOperator) => void
  onRemove?: () => void
}

const skillUsageClasses: Record<CopilotDocV1.SkillUsageType, string> = {
  0: '!text-slate-500 dark:!text-slate-400',
  1: '!text-emerald-500',
  2: '!text-indigo-500',
  3: '!text-rose-500',
}

export const OperatorItem: FC<OperatorItemProps> = memo(
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
        operator.skillUsage ?? CopilotDocV1.SkillUsageType.None,
        operator.skillTimes ?? 1,
      ).replace(/（(\d+)次）/, 'x$1')
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
                    src={getEliteIconUrl(requirements.elite)}
                    alt={'精英' + requirements.elite}
                  />
                </Button>
              </div>
              <div className="absolute z-10 -top-2 -left-2 flex flex-col items-center">
                <NumericInput2
                  intOnly
                  min={1}
                  buttonPosition="none"
                  title="选中后使用鼠标滚轮调整等级"
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
              className="relative w-24 p-0 !py-0 flex flex-col overflow-hidden select-none pointer-events-auto"
              {...attributes}
              {...listeners}
            >
              <OperatorAvatar
                id={info?.id}
                rarity={info?.rarity}
                className="w-24 h-24 rounded-b-none"
                fallback={operator.name}
              />
              <h4
                className={clsx(
                  'm-1 leading-5 font-bold pointer-events-none',
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
              <DetailedSelect
                items={operatorSkillUsages.map((item) =>
                  item.value === CopilotDocV1.SkillUsageType.ReadyToUseTimes
                    ? {
                        ...item,
                        menuItemProps: { shouldDismissPopover: false },
                        description: (
                          <>
                            <div>{item.description}</div>
                            <span className="mr-2 text-lg">x</span>
                            <NumericInput2
                              intOnly
                              min={1}
                              className="inline-flex"
                              inputClassName="!p-0 !w-8 text-center font-semibold"
                              value={operator.skillTimes ?? 1}
                              wheelStepSize={1}
                              onValueChange={(v) => {
                                withCheckpoint(() => {
                                  onChange?.({
                                    ...operator,
                                    skillTimes: v,
                                  })
                                  return {
                                    action:
                                      'set-operator-skillTimes-' +
                                      getInternalId(operator),
                                    desc: '修改技能次数',
                                    squash: true,
                                  }
                                })
                              }}
                            />
                          </>
                        ),
                      }
                    : item,
                )}
                value={operator.skillUsage ?? CopilotDocV1.SkillUsageType.None}
                onItemSelect={(item) => {
                  if (item.value === operator.skillUsage) return
                  withCheckpoint(() => {
                    onChange?.({
                      ...operator,
                      skillUsage: item.value as number,
                    })
                    return {
                      action:
                        'set-operator-skillUsage-' + getInternalId(operator),
                      desc: '修改技能用法',
                      squash: false,
                    }
                  })
                }}
              >
                <Button
                  small
                  minimal
                  className={clsx(
                    '!px-0 h-full !border-none !text-xs !leading-3 !font-normal',
                    skillUsageClasses[
                      operator.skillUsage ?? CopilotDocV1.SkillUsageType.None
                    ],
                  )}
                >
                  {skillUsage}
                </Button>
              </DetailedSelect>
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
                      ? available
                        ? '!bg-purple-100 dark:!bg-purple-900 dark:text-purple-200 text-purple-800'
                        : '!bg-red-100 dark:!bg-red-900 dark:text-red-200 text-red-800'
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
                      '!w-8 h-8 !p-0 !leading-8 !bg-transparent text-center font-bold text-xl !text-inherit !rounded-none !border-2 !border-current cursor-pointer focus:cursor-text',
                      skillLevel > 7 && '!pl-4',
                    )}
                    onFocus={() => {
                      if (operator.skill !== skillNumber) {
                        withCheckpoint(() => {
                          onChange?.({ ...operator, skill: skillNumber })
                          return {
                            action:
                              'set-operator-skill-' + getInternalId(operator),
                            desc: '修改干员技能',
                            squash: false,
                          }
                        })
                      }
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
                    ? '!bg-purple-100 dark:!bg-purple-900 dark:!text-purple-200 !text-purple-800'
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
