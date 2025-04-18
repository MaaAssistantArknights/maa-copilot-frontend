import { Button, Icon, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { compact } from 'lodash-es'
import { FC } from 'react'
import {
  Controller,
  ControllerRenderProps,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { ValueOf } from 'type-fest'

import { ACTION_CONDITIONS, ActionConditionType } from '../../../models/types'
import { joinJSX } from '../../../utils/react'
import { NumericInput2, NumericInput2Props } from '../../editor/NumericInput2'
import { EditorFormValues, useEditorControls } from '../editor-state'
import { CreateActionMenu } from './CreateActionMenu'

interface ActionLinkerProps {
  index: number
  isDragging?: boolean
  isSorting?: boolean
}

export const ActionLinker: FC<ActionLinkerProps> = ({
  index,
  isDragging,
  isSorting,
}) => {
  const { checkpoint } = useEditorControls()
  const { control, watch } = useFormContext<EditorFormValues>()
  const { update } = useFieldArray({ name: 'actions', control })
  const action = watch(`actions.${index}`)
  return (
    <div className="group flex items-center text-gray-400">
      <div
        className={clsx(
          'flex items-center',
          (isDragging || isSorting) && 'opacity-0',
        )}
      >
        <CreateActionMenu index={index}>
          <Button
            small
            minimal
            icon={<Icon icon="plus" className="!text-inherit" />}
            className="h-8 !text-inherit opacity-0 focus:opacity-100 group-hover:opacity-100"
          >
            动作
          </Button>
        </CreateActionMenu>
        <Popover2
          minimal
          placement="right-start"
          popoverClassName="[&>.bp4-popover2-content]:!p-0 overflow-hidden"
          content={
            <Menu>
              {(
                Object.entries(ACTION_CONDITIONS) as [
                  keyof typeof ACTION_CONDITIONS,
                  ValueOf<typeof ACTION_CONDITIONS>,
                ][]
              )
                .filter(([conditionType]) => {
                  switch (conditionType) {
                    case 'intermediatePreDelay':
                      return (
                        index !== 0 && action.intermediatePreDelay === undefined
                      )
                    case 'intermediatePostDelay':
                      return action.intermediatePostDelay === undefined
                    case 'costs':
                      return action.costs === undefined
                    case 'costChanges':
                      return action.costChanges === undefined
                    case 'kills':
                      return action.kills === undefined
                    case 'cooling':
                      return action.cooling === undefined
                  }
                })
                .map(([conditionType, { title, icon, description }]) => (
                  <MenuItem
                    key={conditionType}
                    icon={icon}
                    text={title}
                    labelElement={
                      <Tooltip2 content={description}>
                        <Icon
                          className="!text-gray-300 dark:!text-gray-500"
                          icon="info-sign"
                        />
                      </Tooltip2>
                    }
                    onClick={() => {
                      if (
                        index === 0 &&
                        conditionType === 'intermediatePreDelay'
                      ) {
                        // 第一个动作无法添加前置延迟
                        return
                      }

                      switch (conditionType) {
                        case 'intermediatePreDelay':
                          action.intermediatePreDelay = 0
                          break
                        case 'intermediatePostDelay':
                          action.intermediatePostDelay = 0
                          break
                        case 'costs':
                          action.costs = 0
                          break
                        case 'costChanges':
                          action.costChanges = 0
                          break
                        case 'kills':
                          action.kills = 0
                          break
                        case 'cooling':
                          action.cooling = 0
                          break
                        default:
                          conditionType satisfies never
                      }

                      checkpoint(
                        'add-action-' + conditionType + '-' + index,
                        '添加动作条件',
                        true,
                      )
                      update(index, action)
                    }}
                  />
                ))}
            </Menu>
          }
        >
          <Button
            small
            minimal
            icon={<Icon icon="plus" className="!text-inherit" />}
            className="h-8 !text-inherit opacity-0 focus:opacity-100 group-hover:opacity-100"
          >
            条件
          </Button>
        </Popover2>
      </div>

      <ConditionChain index={index} />
    </div>
  )
}

const ConditionChain: FC<{ index: number }> = ({ index }) => {
  const { checkpoint } = useEditorControls()
  const { control, watch, unregister } = useFormContext<EditorFormValues>()
  const action = watch(`actions.${index}`)
  const conditionNodes = compact([
    index !== 0 && action.intermediatePreDelay !== undefined && (
      <Controller
        key="intermediatePreDelay"
        name={`actions.${index}.intermediatePreDelay`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="延迟"
            unit="ms"
            onRemove={() => {
              checkpoint(
                'remove-action-intermediatePreDelay-' + index,
                '删除动作条件-前置延迟',
                true,
              )
              unregister(`actions.${index}.intermediatePreDelay`)
            }}
            inputProps={{ wheelStepSize: 100 }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-intermediatePreDelay-' + index,
                  '修改动作条件-前置延迟',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
    action.costs !== undefined && (
      <Controller
        key="costs"
        name={`actions.${index}.costs`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="费用"
            onRemove={() => {
              checkpoint(
                'remove-action-costs-' + index,
                '删除动作条件-费用',
                true,
              )
              unregister(`actions.${index}.costs`)
            }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-costs-' + index,
                  '修改动作条件-费用',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
    action.costChanges !== undefined && (
      <Controller
        key="costChanges"
        name={`actions.${index}.costChanges`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="费用变化"
            onRemove={() => {
              checkpoint(
                'remove-action-costChanges-' + index,
                '删除动作条件-费用变化',
                true,
              )
              unregister(`actions.${index}.costChanges`)
            }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-costChanges-' + index,
                  '修改动作条件-费用变化',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
    action.kills !== undefined && (
      <Controller
        key="kills"
        name={`actions.${index}.kills`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="击杀数"
            onRemove={() => {
              checkpoint(
                'remove-action-kills-' + index,
                '删除动作条件-击杀数',
                true,
              )
              unregister(`actions.${index}.kills`)
            }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-kills-' + index,
                  '修改动作条件-击杀数',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
    action.cooling !== undefined && (
      <Controller
        key="cooling"
        name={`actions.${index}.cooling`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="冷却中干员"
            onRemove={() => {
              checkpoint(
                'remove-action-cooling-' + index,
                '删除动作条件-冷却',
                true,
              )
              unregister(`actions.${index}.cooling`)
            }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-cooling-' + index,
                  '修改动作条件-冷却',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
    action.intermediatePostDelay !== undefined && (
      <Controller
        key="intermediatePostDelay"
        name={`actions.${index}.intermediatePostDelay`}
        control={control}
        render={({ field }) => (
          <ConditionNode
            title="延迟"
            unit="ms"
            onRemove={() => {
              checkpoint(
                'remove-action-intermediatePostDelay-' + index,
                '删除动作条件-后置延迟',
                true,
              )
              unregister(`actions.${index}.intermediatePostDelay`)
            }}
            inputProps={{ wheelStepSize: 100 }}
            field={{
              ...field,
              onChange(v) {
                checkpoint(
                  'update-action-intermediatePostDelay-' + index,
                  '修改动作条件-后置延迟',
                  false,
                )
                field.onChange(v)
              },
            }}
          />
        )}
      />
    ),
  ])

  if (conditionNodes.length === 0) {
    return null
  }

  return (
    <div className="ml-4 h-8 flex items-center gap-1">
      <svg
        className="h-full"
        viewBox="0 0 40 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {index === 0 ? (
          <>
            <circle cx="6" cy="25" r="4" fill="currentColor" />
            <path d="M6 25h50" strokeLinejoin="round" />
          </>
        ) : (
          <path d="M2 0v25h50" strokeLinejoin="round" />
        )}
      </svg>
      {joinJSX(
        conditionNodes,
        <svg
          className="h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M0 25h100" />
        </svg>,
      )}
      <svg
        className="h-full"
        viewBox="50 50 50 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M90 96v-21h-90" strokeLinejoin="round" />
        <path
          d="M97 90l-7 7-7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const ConditionNode: FC<{
  title: string
  unit?: string
  onRemove: () => void
  inputProps?: NumericInput2Props
  field: Omit<ControllerRenderProps, 'value'> & { value: number | undefined }
}> = ({
  title,
  unit,
  onRemove,
  inputProps,
  field: { ref, value, onChange },
}) => {
  return (
    <div className="flex items-baseline">
      <Popover2
        placement="bottom"
        content={
          <Menu>
            <MenuItem
              icon="cross"
              intent="danger"
              text="删除"
              onClick={onRemove}
            />
          </Menu>
        }
      >
        <Button
          minimal
          className="!px-0 !py-1 min-h-0 !font-normal !text-inherit"
        >
          {title}
        </Button>
      </Popover2>
      <NumericInput2
        intOnly
        buttonPosition="none"
        inputClassName={clsx(
          'min-w-5 !p-0 !h-5 !leading-none !bg-transparent hover:!bg-gray-200 focus:!bg-gray-200 dark:hover:!bg-gray-600 dark:focus:!bg-gray-600 !border-0 !rounded [&:not(:focus)]:!shadow-none text-center font-semibold !text-inherit !text-[length:inherit]',
        )}
        style={{ width: String(value).length + 0.5 + 'ch' }}
        value={value ?? ''}
        wheelStepSize={1}
        {...inputProps}
        inputRef={ref}
        onValueChange={onChange}
      />
      {unit}
    </div>
  )
}
