import {
  Button,
  Card,
  Classes,
  Divider,
  Icon,
  MenuDivider,
  MenuItem,
} from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { Draft } from 'immer'
import { PrimitiveAtom, atom, useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { selectAtom } from 'jotai/utils'
import { uniqueId } from 'lodash-es'
import { FC, ReactNode, memo, useMemo, useState } from 'react'

import { CopilotDocV1 } from '../../../models/copilot.schema'
import {
  OPERATORS,
  OperatorInfo,
  findOperatorByName,
  findOperatorSkillUsage,
  getSkillUsageTitle,
  operatorSkillUsages,
} from '../../../models/operator'
import { findActionType } from '../../../models/types'
import { useDebouncedQuery } from '../../../utils/useDebouncedQuery'
import { Select } from '../../Select'
import { SortableItemProps } from '../../dnd'
import { DetailedSelect } from '../../editor/DetailedSelect'
import { NumericInput2 } from '../../editor/NumericInput2'
import { OperatorAvatar } from '../../editor/operator/EditorOperator'
import { EditorAction, editorAtoms, useEditorControls } from '../editor-state'
import { getInternalId } from '../reconciliation'
import { ActionLinker } from './ActionLinker'

interface ActionItemProps extends Partial<SortableItemProps> {
  className?: string
  actionAtom: PrimitiveAtom<EditorAction>
}

export const ActionItem: FC<ActionItemProps> = memo(
  ({ className, actionAtom, isDragging, isSorting, attributes, listeners }) => {
    const { withCheckpoint } = useEditorControls()
    const [action, setAction] = useImmerAtom(actionAtom)
    const typeInfo = findActionType(action.type)

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
      <div>
        <ActionLinker
          actionAtom={actionAtom}
          isDragging={isDragging}
          isSorting={isSorting}
        />
        <Card
          className={clsx(
            className,
            '!p-0 flex items-center !rounded-none border-l-4 overflow-hidden bg-[linear-gradient(102deg,#F8F8F8,#F8F8F8_7.5em,white_7.5em)] dark:bg-[linear-gradient(102deg,#1e1a1a,#1e1a1a_7.5em,#2F343C_7.5em)]',
            typeInfo.accent,
            typeInfo.accentText,
          )}
        >
          <h4
            className={clsx(
              'self-start m-1 w-[4.5em] text-2xl font-bold font-serif cursor-move',
            )}
            {...attributes}
            {...listeners}
          >
            {typeInfo.shortTitle}
          </h4>
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
                <Divider className="mx-6 self-stretch rotate-12" />
                <div className="">
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
                            draft.location = [v, draft.location?.[1]]
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
                            draft.location = [draft.location?.[0], v]
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
                <Divider className="mx-6 self-stretch rotate-12" />
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
                  <Divider className="mx-6 self-stretch rotate-12" />
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
        </Card>
      </div>
    )
  },
)
ActionItem.displayName = 'ActionItem'

const createArbitraryOperator = (name: string): OperatorInfo => ({
  id: '',
  name,
  alias: '',
  alt_name: '',
  subProf: '',
  prof: '',
  rarity: 0,
  skills: [],
})

const operatorNamesAtom = selectAtom(
  editorAtoms.operators,
  (operators) => operators.map((op) => op.name),
  (a, b) => a.join() === b.join(),
)
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
  const operatorNames = useAtomValue(operatorNamesAtom)
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
  const isGroup = (name?: string) => name && groupNames.includes(name)

  type Item = (OperatorInfo | { name: string }) & { isHeader?: boolean }
  const [isOpen, setIsOpen] = useState(false)

  const items: Item[] = useMemo(() => {
    if (!isOpen) return []
    const pickedOperators = operatorNames.map((name) => ({ name }))
    const unpickedOperators = pickedOperators.length
      ? OPERATORS.filter((op) => {
          const index = operatorNames.indexOf(op.name)
          if (index !== -1) {
            pickedOperators[index] = op
            return false
          }
          return true
        })
      : OPERATORS
    const items: Item[] = [
      ...groupNames.map((name) => ({ name })),
      ...pickedOperators,
    ]
    if (items.length > 0) {
      items.push({ name: uniqueId(), isHeader: true })
    }
    items.push(...unpickedOperators)
    return items
  }, [operatorNames, groupNames, isOpen])

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['name', 'alias', 'alt_name'],
        threshold: 0.3,
      }),
    [items],
  )

  const { query, trimmedDebouncedQuery, updateQuery, onOptionMouseDown } =
    useDebouncedQuery()

  const filteredItems = useMemo(
    () =>
      trimmedDebouncedQuery
        ? fuse.search(trimmedDebouncedQuery).map((el) => el.item)
        : items,
    [items, fuse, trimmedDebouncedQuery],
  )
  const operatorInfo = operator && findOperatorByName(operator.name)
  const displayName = operatorInfo?.name || action.name || '请选择干员'
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
    <Select<Item>
      query={query}
      onQueryChange={(query) => updateQuery(query, false)}
      items={OPERATORS}
      itemDisabled={(item) => !!item.isHeader}
      itemRenderer={(item, { index, handleClick, handleFocus, modifiers }) =>
        item.isHeader ? (
          <MenuDivider key={item.name} />
        ) : (
          <MenuItem
            roleStructure="listoption"
            className={clsx(
              'py-0 items-center',
              modifiers.active && Classes.ACTIVE,
            )}
            // item 是 group 时要处理 name 是空字符串以及 name 与干员或其他 group 重名的情况，
            // 所以干脆用 index 作为 key 了
            key={
              isGroup(item.name) ? index : 'id' in item ? item.id : item.name
            }
            text={
              <div className="flex items-center gap-2">
                <OperatorAvatar
                  className="w-8 h-8 leading-3"
                  id={
                    isGroup(item.name)
                      ? undefined
                      : 'id' in item
                        ? item.id
                        : undefined
                  }
                  name={item.name}
                  fallback={
                    isGroup(item.name) ? (
                      <Icon icon="people" size={20} className="align-middle" />
                    ) : (
                      item.name
                    )
                  }
                />
                {item.name}
              </div>
            }
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={onOptionMouseDown}
            selected={action.name === item.name}
            disabled={modifiers.disabled}
          />
        )
      }
      itemListPredicate={() => filteredItems}
      createNewItemFromQuery={(query) => createArbitraryOperator(query)}
      createNewItemRenderer={(query, active, handleClick) => (
        <MenuItem
          key="create-new-item"
          roleStructure="listoption"
          text={`使用自定义干员 "${query}"`}
          className={clsx('py-0 items-center', active && Classes.ACTIVE)}
          icon="text-highlight"
          onClick={handleClick}
        />
      )}
      inputProps={{
        placeholder: '搜索干员',
      }}
      resetOnSelect={true}
      popoverProps={{
        placement: 'right-start',
        onOpening: () => setIsOpen(true),
        onClosed: () => setIsOpen(false),
      }}
      onItemSelect={(item) => {
        withCheckpoint(() => {
          setAction({
            ...action,
            name: item.name,
          })
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
            name={action.name}
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
    </Select>
  )
}
