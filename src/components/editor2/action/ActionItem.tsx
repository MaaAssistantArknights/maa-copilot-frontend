import {
  Button,
  Card,
  Classes,
  Divider,
  Icon,
  MenuItem,
} from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { FC, useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

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
import {
  EditorFormValues,
  EditorOperator,
  useEditorControls,
} from '../editor-state'
import { ActionLinker } from './ActionLinker'

interface ActionItemProps extends Partial<SortableItemProps> {
  className?: string
  index: number
  onDuplicate?: () => void
  onRemove?: () => void
}

export const ActionItem: FC<ActionItemProps> = ({
  className,
  index,
  onDuplicate,
  onRemove,
  isDragging,
  isSorting,
  attributes,
  listeners,
}) => {
  const { checkpoint } = useEditorControls()
  const { control, watch } = useFormContext<EditorFormValues>()
  const type = watch(`actions.${index}.type`)
  const typeInfo = findActionType(type)

  return (
    <div>
      <ActionLinker
        index={index}
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
        {(type === CopilotDocV1.Type.Deploy ||
          type === CopilotDocV1.Type.Retreat ||
          type === CopilotDocV1.Type.Skill ||
          type === CopilotDocV1.Type.SkillUsage ||
          type === CopilotDocV1.Type.BulletTime) && (
          <ActionTarget index={index} />
        )}
        {(type === CopilotDocV1.Type.Deploy ||
          type === CopilotDocV1.Type.Retreat ||
          type === CopilotDocV1.Type.Skill ||
          type === CopilotDocV1.Type.BulletTime) && (
          <>
            <Divider className="mx-6 self-stretch rotate-12" />
            <div className="">
              <div className="flex items-center text-3xl">
                <span className="text-gray-300 dark:text-gray-600">{'('}</span>
                <Controller
                  control={control}
                  name={`actions.${index}.location.0`}
                  render={({ field: { ref, onChange, value } }) => (
                    <NumericInput2
                      intOnly
                      buttonPosition="none"
                      inputClassName="!w-9 mx-px mt-1 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 dark:hover:!bg-gray-600 dark:focus:!bg-gray-600 !border-0 !rounded [&:not(:focus)]:!shadow-none !text-inherit text-3xl font-semibold text-center"
                      inputRef={ref}
                      value={value ?? ''}
                      onValueChange={(v) => {
                        checkpoint(
                          'update-action-location-x-' + index,
                          '修改坐标',
                          false,
                        )
                        onChange(v)
                      }}
                      onWheelFocused={(e) => {
                        e.preventDefault()
                        checkpoint(
                          'update-action-location-x-' + index,
                          '修改坐标',
                          false,
                        )
                        onChange((value ?? 0) - Math.sign(e.deltaY))
                      }}
                    />
                  )}
                />
                <span className="mt-3 text-gray-300 dark:text-gray-600 text-xl font-serif">
                  ,
                </span>
                <Controller
                  control={control}
                  name={`actions.${index}.location.1`}
                  render={({ field: { ref, onChange, value } }) => (
                    <NumericInput2
                      intOnly
                      buttonPosition="none"
                      inputClassName="!w-9 mx-px mt-1 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 dark:hover:!bg-gray-600 dark:focus:!bg-gray-600 !border-0 !rounded [&:not(:focus)]:!shadow-none !text-inherit text-3xl font-semibold text-center"
                      inputRef={ref}
                      value={value ?? ''}
                      onValueChange={(v) => {
                        checkpoint(
                          'update-action-location-y-' + index,
                          '修改坐标',
                          false,
                        )
                        onChange(v)
                      }}
                      onWheelFocused={(e) => {
                        e.preventDefault()
                        checkpoint(
                          'update-action-location-y-' + index,
                          '修改坐标',
                          false,
                        )
                        onChange((value || 0) - Math.sign(e.deltaY))
                      }}
                    />
                  )}
                />
                <span className="text-gray-300 dark:text-gray-600">{')'}</span>
              </div>
              <div className="text-xs text-gray-500">位置</div>
            </div>
          </>
        )}
        {type === CopilotDocV1.Type.Deploy && (
          <>
            <Divider className="mx-6 self-stretch rotate-12" />
            <div className="mt-2 !text-inherit">
              <Controller
                control={control}
                name={`actions.${index}.direction`}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center !text-inherit">
                    {Object.values(CopilotDocV1.Direction).map((dir) => (
                      <Button
                        small
                        minimal
                        className={clsx(
                          '!px-2.5 !bg-transparent [&_.bp4-icon]:!text-current',
                          value === dir
                            ? '!text-inherit drop-shadow'
                            : '!text-gray-200 hover:!text-gray-400',
                        )}
                        key={dir}
                        active={value === dir}
                        onClick={() => {
                          checkpoint(
                            'update-action-direction-' + index,
                            '修改朝向',
                            false,
                          )
                          onChange(dir)
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
                )}
              />
              <div className="ml-1 mt-1 text-xs text-gray-500">朝向</div>
            </div>
          </>
        )}
        {type === CopilotDocV1.Type.SkillUsage && (
          <>
            <Divider className="mx-6 self-stretch rotate-12" />
            <div className="">
              <Controller
                control={control}
                name={`actions.${index}.skillUsage`}
                render={({ field: { ref, onChange, value } }) => {
                  const selectedAction =
                    value === undefined
                      ? undefined
                      : findOperatorSkillUsage(value)
                  return (
                    <div className="flex items-baseline gap-1 text-xl">
                      <DetailedSelect
                        items={operatorSkillUsages}
                        value={value}
                        onItemSelect={(item) => {
                          checkpoint(
                            'update-action-skill-usage',
                            '修改技能用法',
                            true,
                          )
                          onChange(item.value)
                        }}
                      >
                        <Button
                          minimal
                          className="-ml-1 !px-1 !py-0 !text-xl !font-normal !text-inherit"
                          text={selectedAction?.shortTitle || '请选择'}
                          ref={ref}
                        />
                      </DetailedSelect>
                      {value ===
                        CopilotDocV1.SkillUsageType.ReadyToUseTimes && (
                        <>
                          x
                          <Controller
                            control={control}
                            name={`actions.${index}.skillTimes`}
                            render={({ field: { ref, onChange, value } }) => (
                              <NumericInput2
                                intOnly
                                min={1}
                                buttonPosition="none"
                                inputClassName="-ml-1 !w-8 !p-0 !leading-3 hover:!bg-gray-100 focus:!bg-gray-100 !border-0 !rounded [&:not(:focus)]:!shadow-none text-center font-semibold !text-inherit !text-[length:inherit]"
                                inputRef={ref}
                                value={value ?? ''}
                                onValueChange={(v) => {
                                  checkpoint(
                                    'update-action-skill-times-' + index,
                                    '修改技能次数',
                                    false,
                                  )
                                  onChange(v)
                                }}
                                onWheelFocused={(e) => {
                                  e.preventDefault()
                                  checkpoint(
                                    'update-action-skill-times-' + index,
                                    '修改技能次数',
                                    false,
                                  )
                                  onChange(
                                    Math.max(
                                      1,
                                      (value || 0) - Math.sign(e.deltaY),
                                    ),
                                  )
                                }}
                              />
                            )}
                          />
                        </>
                      )}
                    </div>
                  )
                }}
              />
              <div className="text-xs text-gray-500">用法</div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

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

const ActionTarget: FC<{ index: number }> = ({ index }) => {
  const { checkpoint } = useEditorControls()
  const { control, watch } = useFormContext<EditorFormValues>()
  const operators = watch('opers')
  const groups = watch('groups')
  const isGroup = (name?: string) => name && groups.some((g) => g.name === name)

  type Item = OperatorInfo | EditorOperator
  const [isOpen, setIsOpen] = useState(false)

  const items: Item[] = useMemo(() => {
    if (!isOpen) return []
    const pickedOperators: OperatorInfo[] = []
    const unpickedOperators = operators.length
      ? OPERATORS.filter((op) => {
          if (operators.some((o) => o?.name === op.name)) {
            pickedOperators.push(op)
            return false
          }
          return true
        })
      : OPERATORS
    return [...groups, ...pickedOperators, ...unpickedOperators]
  }, [operators, groups, isOpen])

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

  return (
    <Controller
      control={control}
      name={`actions.${index}.name`}
      render={({ field: { onChange, value } }) => {
        const operatorInfo = value ? findOperatorByName(value) : undefined
        const displayName = operatorInfo?.name || value || '请选择干员'
        const operator = value
          ? operators?.find((op) => op?.name === value)
          : undefined
        const skillUsage =
          operator &&
          '技能' +
            getSkillUsageTitle(
              operator.skillUsage ?? 0,
              operator.skillTimes ?? 1,
            ).replace(/（(\d)次）/, 'x$1')
        const subtitle = isGroup(value)
          ? '干员组'
          : skillUsage ||
            (operatorInfo
              ? operatorInfo?.prof === 'TOKEN'
                ? '召唤物'
                : '干员'
              : // 自定义干员、关卡里的道具之类
                '未知单位')
        return (
          <Select
            query={query}
            onQueryChange={(query) => updateQuery(query, false)}
            items={OPERATORS}
            itemRenderer={(
              item,
              { index, handleClick, handleFocus, modifiers },
            ) => (
              <MenuItem
                roleStructure="listoption"
                className={clsx(
                  'py-0 items-center',
                  modifiers.active && Classes.ACTIVE,
                )}
                // item 是 group 时要处理 name 是空字符串以及 name 与干员或其他 group 重名的情况，
                // 所以干脆用 index 作为 key 了
                key={isGroup(item.name) ? index : (item as OperatorInfo).id}
                text={
                  <div className="flex items-center gap-2">
                    <OperatorAvatar
                      className="w-8 h-8 leading-3"
                      id={
                        isGroup(item.name)
                          ? undefined
                          : (item as OperatorInfo).id
                      }
                      name={item.name}
                      fallback={
                        isGroup(item.name) ? (
                          <Icon
                            icon="people"
                            size={20}
                            className="align-middle"
                          />
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
                selected={value === item.name}
                disabled={modifiers.disabled}
              />
            )}
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
              checkpoint('update-action-target', '修改动作目标', true)
              onChange(item.name)
            }}
          >
            <Button minimal className="my-1 !p-0 !border-0">
              <div className="flex items-center">
                <OperatorAvatar
                  className="w-16 h-16"
                  name={value}
                  fallback={
                    isGroup(value) ? <Icon icon="people" size={32} /> : value
                  }
                />
                <div className="ml-1 w-[6.5em]">
                  <div
                    className={clsx(
                      'truncate',
                      displayName.length > 6 && 'text-xs',
                    )}
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
      }}
    />
  )
}
