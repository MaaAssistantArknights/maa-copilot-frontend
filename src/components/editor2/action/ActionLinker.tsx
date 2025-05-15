import { Button, Icon, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { Draft } from 'immer'
import { PrimitiveAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { compact } from 'lodash-es'
import { FC } from 'react'
import { ValueOf } from 'type-fest'

import { ACTION_CONDITIONS, ActionConditionType } from '../../../models/types'
import { joinJSX } from '../../../utils/react'
import { NumericInput2, NumericInput2Props } from '../../editor/NumericInput2'
import { EditorAction, editorAtoms, useEditorControls } from '../editor-state'
import { CreateActionMenu } from './CreateActionMenu'

interface ActionLinkerProps {
  actionAtom: PrimitiveAtom<EditorAction>
  isDragging?: boolean
  isSorting?: boolean
}

export const ActionLinker: FC<ActionLinkerProps> = ({
  actionAtom,
  isDragging,
  isSorting,
}) => {
  const { withCheckpoint } = useEditorControls()
  const actionAtoms = useAtomValue(editorAtoms.actionAtoms)
  const [action, setAction] = useImmerAtom(actionAtom)
  const index = actionAtoms.indexOf(actionAtom)
  // edge case?
  if (index === -1) {
    return null
  }
  return (
    <div className="group flex items-center text-gray-400">
      <div
        className={clsx(
          'flex items-center',
          (isDragging || isSorting) && 'opacity-0',
        )}
      >
        <CreateActionMenu actionAtom={actionAtom}>
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

                      withCheckpoint(() => {
                        setAction((draft) => {
                          switch (conditionType) {
                            case 'intermediatePreDelay':
                              draft.intermediatePreDelay = 0
                              break
                            case 'intermediatePostDelay':
                              draft.intermediatePostDelay = 0
                              break
                            case 'costs':
                              draft.costs = 0
                              break
                            case 'costChanges':
                              draft.costChanges = 0
                              break
                            case 'kills':
                              draft.kills = 0
                              break
                            case 'cooling':
                              draft.cooling = 0
                              break
                            default:
                              conditionType satisfies never
                          }
                        })
                        return {
                          action: 'add-action-' + conditionType,
                          desc: '添加动作条件',
                          squash: false,
                        }
                      })
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

      <ConditionChain actionAtom={actionAtom} index={index} />
    </div>
  )
}

const ConditionChain: FC<{
  actionAtom: PrimitiveAtom<EditorAction>
  index: number
}> = ({ actionAtom, index }) => {
  const [action, setAction] = useImmerAtom(actionAtom)
  const conditionNodes = compact([
    index !== 0 && action.intermediatePreDelay !== undefined && (
      <ConditionNode
        key="intermediatePreDelay"
        conditionKey="intermediatePreDelay"
        title="延迟"
        unit="ms"
        inputProps={{ wheelStepSize: 100 }}
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
    action.costs !== undefined && (
      <ConditionNode
        key="costs"
        conditionKey="costs"
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
    action.costChanges !== undefined && (
      <ConditionNode
        key="costChanges"
        conditionKey="costChanges"
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
    action.kills !== undefined && (
      <ConditionNode
        key="kills"
        conditionKey="kills"
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
    action.cooling !== undefined && (
      <ConditionNode
        key="cooling"
        conditionKey="cooling"
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
    action.intermediatePostDelay !== undefined && (
      <ConditionNode
        key="intermediatePostDelay"
        conditionKey="intermediatePostDelay"
        title="延迟"
        unit="ms"
        inputProps={{ wheelStepSize: 100 }}
        index={index}
        action={action}
        setAction={setAction}
      />
    ),
  ])

  if (conditionNodes.length === 0) {
    return null
  }

  return (
    <div className="ml-4 flex flex-wrap items-center gap-1">
      <svg
        className="h-8"
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
          className="h-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M0 25h100" />
        </svg>,
      )}
      <svg
        className="h-8"
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

interface ConditionNodeProps {
  conditionKey: ActionConditionType
  title?: string
  unit?: string
  inputProps?: NumericInput2Props
  index: number
  action: EditorAction
  setAction: (fn: (v: Draft<EditorAction>) => void) => void
}

const ConditionNode: FC<ConditionNodeProps> = ({
  title,
  unit,
  inputProps,
  index,
  conditionKey,
  action,
  setAction,
}) => {
  const { withCheckpoint } = useEditorControls()
  const value = action[conditionKey]!
  const typeInfo = ACTION_CONDITIONS[conditionKey]
  title ??= typeInfo.title
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
              onClick={() => {
                withCheckpoint(() => {
                  setAction((draft) => {
                    draft[conditionKey] = undefined
                  })
                  return {
                    action: `unset-action-${conditionKey}-${index}`,
                    desc: '删除动作条件-' + typeInfo.title,
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
        value={value}
        wheelStepSize={1}
        {...inputProps}
        onValueChange={(v) => {
          withCheckpoint(() => {
            setAction((draft) => {
              draft[conditionKey] = v
            })
            return {
              action: `set-action-${conditionKey}-${index}`,
              desc: '修改动作条件-' + typeInfo.title,
              squash: true,
            }
          })
        }}
      />
      {unit}
    </div>
  )
}
