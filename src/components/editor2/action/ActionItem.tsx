import { Button, Card, Divider, Icon } from '@blueprintjs/core'

import clsx from 'clsx'
import { Draft } from 'immer'
import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { selectAtom } from 'jotai/utils'
import { FC, ReactNode, memo, useMemo } from 'react'

import { CopilotDocV1 } from '../../../models/copilot.schema'
import {
  findOperatorByName,
  findOperatorSkillUsage,
  getSkillUsageTitle,
  operatorSkillUsages,
} from '../../../models/operator'
import { findActionType } from '../../../models/types'
import { SortableItemProps } from '../../dnd'
import { DetailedSelect } from '../../editor/DetailedSelect'
import { NumericInput2 } from '../../editor/NumericInput2'
import { OperatorAvatar } from '../../editor/operator/EditorOperator'
import { EditorAction, editorAtoms, useEditorControls } from '../editor-state'
import { OperatorSelect } from '../operator/OperatorSelect'
import { createAction, getInternalId } from '../reconciliation'
import { ActionLinker } from './ActionLinker'

interface ActionItemProps extends Partial<SortableItemProps> {
  className?: string
  actionAtom: PrimitiveAtom<EditorAction>
}

export const ActionItem: FC<ActionItemProps> = memo(
  ({ className, actionAtom, isDragging, isSorting, attributes, listeners }) => {
    const { withCheckpoint } = useEditorControls()
    const dispatchActions = useSetAtom(editorAtoms.actionAtoms)
    const [action, setAction] = useImmerAtom(actionAtom)
    const [ui, setUI] = useImmerAtom(editorAtoms.ui)
    const typeInfo = findActionType(action.type)
    const isActive = getInternalId(action) === ui.activeActionId

    // 类型断言不能用在多个参数上，所以只能组装成一个对象然后再解构了
    // https://github.com/microsoft/TypeScript/issues/26916
    type RenderArgs<A> = {
      actionAtom: PrimitiveAtom<A>
      action: A
      setAction: (fn: (draft: Draft<A>) => void) => void
    }
    const renderForTypes = <
      T extends CopilotDocV1.Type,
      A extends EditorAction = Extract<EditorAction, { type: T }>,
    >(
      types: T[],
      render: (args: RenderArgs<A>) => ReactNode,
    ) => {
      if (types.includes(action.type as T)) {
        return render({ actionAtom, action, setAction } as RenderArgs<A>)
      }
      return null
    }

    return (
      <div
        onMouseDownCapture={() => {
          setUI((ui) => {
            ui.activeActionId = getInternalId(action)
          })
        }}
      >
        <ActionLinker
          actionAtom={actionAtom}
          isDragging={isDragging}
          isSorting={isSorting}
        />
        <Card
          className={clsx(
            className,
            '!p-0 flex items-center !rounded-none',
            typeInfo.accentText,
          )}
        >
          <h4
            className={clsx(
              'relative shrink-0 self-stretch w-[5em] text-2xl font-bold font-serif bg-gray-100 dark:bg-gray-700 cursor-move',
              // regarding the calc(), we try to make the right border tilt by 12deg, so the x coordinate
              // of the bottom right corner will be 100% - height * tan(12deg), where height turns out to be 4.5rem
              '[clip-path:polygon(0_0,100%_0,calc(100%-.96rem)_100%,0_100%)]',
            )}
            {...attributes}
            {...listeners}
          >
            <div
              className={clsx(
                'p-1 pl-2 w-full',
                // hide the underneath element later to avoid edge cases where the above element does not align perfectly
                isActive && 'opacity-0 transition-opacity delay-100',
              )}
            >
              {typeInfo.shortTitle}
            </div>
            <div
              className={clsx(
                'p-1 pl-2 w-full',
                'absolute top-0 bottom-0 left-0 text-white transition-[clip-path]',
                typeInfo.accentBg,
                isActive
                  ? '[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]'
                  : '[clip-path:polygon(0_0,4px_0,4px_100%,0_100%)]',
              )}
            >
              {typeInfo.shortTitle}
            </div>
          </h4>
          <div className="flex-[0_1_1rem]" />
          {renderForTypes(
            [
              CopilotDocV1.Type.Deploy,
              CopilotDocV1.Type.Retreat,
              CopilotDocV1.Type.Skill,
              CopilotDocV1.Type.SkillUsage,
              CopilotDocV1.Type.BulletTime,
            ],
            ({ actionAtom }) => (
              <ActionTarget actionAtom={actionAtom} />
            ),
          )}
          {renderForTypes(
            [
              CopilotDocV1.Type.Deploy,
              CopilotDocV1.Type.Retreat,
              CopilotDocV1.Type.Skill,
              CopilotDocV1.Type.BulletTime,
            ],
            ({ action, setAction }) => (
              <>
                <div className="grow self-stretch max-w-10 flex items-stretch justify-center">
                  <Divider className="rotate-12" />
                </div>
                <div className="shrink-0">
                  <div className="flex items-center text-3xl">
                    <span className="text-gray-300 dark:text-gray-600">
                      {'('}
                    </span>
                    <NumericInput2
                      intOnly
                      buttonPosition="none"
                      inputClassName="!w-9 mx-px mt-1 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 dark:hover:!bg-gray-600 dark:focus:!bg-gray-600 !border-0 !rounded [&:not(:focus)]:!shadow-none !text-inherit text-3xl font-semibold text-center"
                      value={action.location?.[0] ?? ''}
                      wheelStepSize={1}
                      onValueChange={(v) => {
                        withCheckpoint(() => {
                          setAction((draft) => {
                            draft.location = [v, draft.location?.[1] ?? 0]
                          })
                          return {
                            action:
                              'set-action-location-x-' + getInternalId(action),
                            desc: '修改坐标',
                            squash: false,
                          }
                        })
                      }}
                    />
                    <span className="mt-3 text-gray-300 dark:text-gray-600 text-xl font-serif">
                      ,
                    </span>
                    <NumericInput2
                      intOnly
                      buttonPosition="none"
                      inputClassName="!w-9 mx-px mt-1 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 dark:hover:!bg-gray-600 dark:focus:!bg-gray-600 !border-0 !rounded [&:not(:focus)]:!shadow-none !text-inherit text-3xl font-semibold text-center"
                      value={action.location?.[1] ?? ''}
                      wheelStepSize={1}
                      onValueChange={(v) => {
                        withCheckpoint(() => {
                          setAction((draft) => {
                            draft.location = [draft.location?.[0] ?? 0, v]
                          })
                          return {
                            action:
                              'set-action-location-y-' + getInternalId(action),
                            desc: '修改坐标',
                            squash: false,
                          }
                        })
                      }}
                    />
                    <span className="text-gray-300 dark:text-gray-600">
                      {')'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">位置</div>
                </div>
              </>
            ),
          )}
          {renderForTypes(
            [CopilotDocV1.Type.Deploy],
            ({ action, setAction }) => (
              <>
                <div className="grow self-stretch max-w-10 flex items-stretch justify-center">
                  <Divider className="rotate-12" />
                </div>
                <div className="mt-2 !text-inherit">
                  <div className="flex items-center !text-inherit">
                    {Object.values(CopilotDocV1.Direction).map((dir) => (
                      <Button
                        small
                        minimal
                        className={clsx(
                          '!px-2.5 !bg-transparent [&_.bp4-icon]:!text-current',
                          action.direction === dir
                            ? '!text-inherit drop-shadow'
                            : '!text-gray-200 hover:!text-gray-400',
                        )}
                        key={dir}
                        active={action.direction === dir}
                        onClick={() => {
                          withCheckpoint(() => {
                            setAction((draft) => {
                              draft.direction = dir
                            })
                            return {
                              action:
                                'set-action-direction-' + getInternalId(action),
                              desc: '修改朝向',
                              squash: false,
                            }
                          })
                        }}
                        icon={
                          <Icon
                            size={24}
                            icon={
                              dir === CopilotDocV1.Direction.Left
                                ? 'arrow-left'
                                : dir === CopilotDocV1.Direction.Right
                                  ? 'arrow-right'
                                  : dir === CopilotDocV1.Direction.Up
                                    ? 'arrow-up'
                                    : dir === CopilotDocV1.Direction.Down
                                      ? 'arrow-down'
                                      : 'disable'
                            }
                          />
                        }
                      />
                    ))}
                  </div>
                  <div className="ml-1 mt-1 text-xs text-gray-500">朝向</div>
                </div>
              </>
            ),
          )}
          {renderForTypes(
            [CopilotDocV1.Type.SkillUsage],
            ({ action, setAction }) => {
              const usageInfo =
                action.skillUsage === undefined
                  ? undefined
                  : findOperatorSkillUsage(action.skillUsage)
              return (
                <>
                  <div className="grow self-stretch max-w-10 flex items-stretch justify-center">
                    <Divider className="rotate-12" />
                  </div>
                  <div className="">
                    <div className="flex items-baseline gap-1 text-xl">
                      <DetailedSelect
                        items={operatorSkillUsages}
                        value={action.skillUsage}
                        onItemSelect={(item) => {
                          if (item.value === action.skillUsage) return
                          withCheckpoint(() => {
                            setAction((draft) => {
                              draft.skillUsage = item.value as number
                            })
                            return {
                              action:
                                'set-action-skillUsage-' +
                                getInternalId(action),
                              desc: '修改技能用法',
                              squash: false,
                            }
                          })
                        }}
                      >
                        <Button
                          minimal
                          className="-ml-1 !px-1 !py-0 !text-xl !font-normal !text-inherit"
                          text={usageInfo?.shortTitle || '请选择'}
                        />
                      </DetailedSelect>
                      {action.skillUsage ===
                        CopilotDocV1.SkillUsageType.ReadyToUseTimes && (
                        <>
                          x
                          <NumericInput2
                            intOnly
                            min={1}
                            buttonPosition="none"
                            inputClassName="-ml-1 !w-8 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 !border-0 !rounded [&:not(:focus)]:!shadow-none text-center font-semibold !text-inherit !text-[length:inherit]"
                            value={action.skillTimes ?? ''}
                            wheelStepSize={1}
                            onValueChange={(v) => {
                              withCheckpoint(() => {
                                setAction((draft) => {
                                  draft.skillTimes = v
                                })
                                return {
                                  action:
                                    'set-action-skill-times-' +
                                    getInternalId(action),
                                  desc: '修改技能次数',
                                  squash: false,
                                }
                              })
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">用法</div>
                  </div>
                </>
              )
            },
          )}
          <div className="ml-auto flex">
            <Button
              minimal
              large
              icon="duplicate"
              title="复制一份"
              onClick={() => {
                withCheckpoint(() => {
                  dispatchActions({
                    type: 'insert',
                    value: createAction(action),
                    before: actionAtom,
                  })
                  return {
                    action: 'copy-action-' + getInternalId(action),
                    desc: '复制动作',
                    squash: false,
                  }
                })
              }}
            />
            <Button
              minimal
              large
              icon="cross"
              title="删除"
              intent="danger"
              onClick={() => {
                withCheckpoint(() => {
                  dispatchActions({
                    type: 'remove',
                    atom: actionAtom,
                  })
                  return {
                    action: 'delete-action-' + getInternalId(action),
                    desc: '删除动作',
                    squash: false,
                  }
                })
              }}
            />
          </div>
        </Card>
      </div>
    )
  },
)
ActionItem.displayName = 'ActionItem'

const groupNamesAtom = selectAtom(
  editorAtoms.groups,
  (groups) => groups.map((g) => g.name),
  (a, b) => a.join() === b.join(),
)

const ActionTarget: FC<{
  actionAtom: PrimitiveAtom<
    Extract<
      EditorAction,
      {
        type:
          | CopilotDocV1.Type.Deploy
          | CopilotDocV1.Type.Retreat
          | CopilotDocV1.Type.Skill
          | CopilotDocV1.Type.SkillUsage
          | CopilotDocV1.Type.BulletTime
      }
    >
  >
}> = ({ actionAtom }) => {
  const { withCheckpoint } = useEditorControls()
  const [action, setAction] = useAtom(actionAtom)
  const groupNames = useAtomValue(groupNamesAtom)
  const operator = useAtomValue(
    useMemo(
      () =>
        atom((get) =>
          get(editorAtoms.operators).find((op) => op.name === action.name),
        ),
      [action.name],
    ),
  )
  const isGroup = (name?: string) =>
    name !== undefined && groupNames.includes(name)

  const operatorInfo = operator && findOperatorByName(operator.name)
  const displayName =
    operatorInfo?.name ||
    action.name ||
    (isGroup(action.name) ? '(未命名干员组)' : '请选择干员')
  const skillUsage =
    operator &&
    '技能' +
      getSkillUsageTitle(
        operator.skillUsage ?? 0,
        operator.skillTimes ?? 1,
      ).replace(/（(\d)次）/, 'x$1')
  const subtitle = isGroup(action.name)
    ? '干员组'
    : skillUsage ||
      (operatorInfo
        ? operatorInfo?.prof === 'TOKEN'
          ? '召唤物'
          : '干员'
        : // 自定义干员、关卡里的道具之类
          '未知单位')
  return (
    <OperatorSelect
      liftPicked
      className="shrink-0"
      value={action.name}
      onSelect={(name) => {
        withCheckpoint(() => {
          setAction({ ...action, name })
          return {
            action: 'set-action-name-' + getInternalId(action),
            desc: '修改动作目标',
            squash: false,
          }
        })
      }}
    >
      <Button minimal className="my-1 !p-0 !border-0">
        <div className="flex items-center">
          <OperatorAvatar
            className="w-16 h-16"
            name={isGroup(action.name) ? undefined : action.name}
            fallback={
              isGroup(action.name) ? (
                <Icon icon="people" size={32} />
              ) : (
                action.name
              )
            }
          />
          <div className="ml-1 w-[6.5em]">
            <div
              className={clsx('truncate', displayName.length > 6 && 'text-xs')}
              title={displayName.length > 6 ? displayName : undefined}
            >
              {displayName}
            </div>
            <Divider className="m-0 mr-1" />
            <div className="text-gray-500 text-xs font-normal truncate">
              {subtitle}
            </div>
          </div>
        </div>
      </Button>
    </OperatorSelect>
  )
}
