import { Icon, Tag } from '@blueprintjs/core'

import clsx from 'clsx'
import { compact } from 'lodash-es'
import { FC, useMemo, useState } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { FCC, FieldErrorsWithGlobal } from 'types'

import { CardTitle } from 'components/CardTitle'
import { FactItem } from 'components/FactItem'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { findActionType } from 'models/types'

import {
  findOperatorDirection,
  findOperatorSkillUsage,
} from '../../../models/operator'
import { formatDuration } from '../../../utils/times'
import { SortableItemProps } from '../../dnd'
import { CardDeleteOption, CardDuplicateOption } from '../CardOptions'
import { EditorFieldProps } from '../EditorFieldProps'
import { ExpandableCard } from '../ExpandableCard'
import { defaultAction } from '../utils/defaults'
import {
  EditorActionForm,
  EditorActionFormProps,
  EditorActionFormValues,
} from './EditorActionForm'

interface EditorActionItemProps
  extends EditorFieldProps<CopilotDocV1.Operation, CopilotDocV1.Action>,
    Partial<SortableItemProps> {
  onDuplicate?: () => void
  onRemove?: () => void
}

export const EditorActionItem: FC<EditorActionItemProps> = ({
  control,
  name,
  onDuplicate,
  onRemove,
  attributes,
  listeners,
}) => {
  const action = useWatch({
    control,
    name,
    defaultValue: defaultAction,
  })

  const type = findActionType(action.type)

  const [expand, setExpand] = useState(false)
  const [errors, setErrors] = useState(
    {} as FieldErrorsWithGlobal<EditorActionFormValues>,
  )

  const error = useMemo(
    // display global error or the first field error
    () => (errors.global || compact(Object.values(errors))[0])?.message,
    [errors],
  )

  return (
    <ExpandableCard
      className={clsx('border-l-4', type.accent)}
      expand={expand}
      setExpand={setExpand}
      content={
        <>
          <EditorActionForm
            control={control}
            action={action}
            onChange={onChange}
            onError={setErrors}
          />
        </>
      }
    >
      <div className="flex">
        <div className="flex-grow">
          <div className="flex items-center">
            <Icon
              className="cursor-grab active:cursor-grabbing p-1 -my-1 -ml-2 mr-2 rounded-[1px]"
              icon="drag-handle-vertical"
              {...attributes}
              {...listeners}
            />
            <CardTitle className="mb-0 flex-grow flex" icon={type.icon}>
              <span className="mr-2">{type.title}</span>
              <CardDuplicateOption onClick={onDuplicate} />
              <CardDeleteOption onClick={onRemove} />
              {error && (
                <Tag minimal intent="danger">
                  {error}
                </Tag>
              )}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 w-full">
            {'name' in action && action.name && (
              <FactItem
                dense
                title={action.name}
                icon="mugshot"
                className="font-bold"
              />
            )}

            {'skillUsage' in action && (
              <FactItem
                dense
                title={findOperatorSkillUsage(action.skillUsage).title}
                icon="swap-horizontal"
              />
            )}

            {'location' in action && action.location && (
              <FactItem dense title="坐标" icon="map-marker">
                <span className="font-mono">{action.location.join(', ')}</span>
              </FactItem>
            )}

            {'direction' in action && (
              <FactItem dense title="朝向" icon="compass">
                <span className="font-mono">
                  {findOperatorDirection(action.direction).title}
                </span>
              </FactItem>
            )}
          </div>
        </div>

        {/* direction:rtl is for the grid to place columns from right to left; need to set it back to ltr for the children */}
        <div className="grid grid-flow-row grid-cols-2 gap-y-2 text-right [direction:rtl] [&>*]:[direction:ltr]">
          <InlineCondition title="击杀">{action.kills || '-'}</InlineCondition>
          <InlineCondition title="回费">
            {action.costChanges || '-'}
          </InlineCondition>
          <InlineCondition title="前置">
            {action.preDelay ? formatDuration(action.preDelay) : '-'}
          </InlineCondition>
          <InlineCondition title="后置">
            {action.rearDelay ? formatDuration(action.rearDelay) : '-'}
          </InlineCondition>
          <InlineCondition title="冷却中">
            {action.cooling || '-'}
          </InlineCondition>
        </div>
      </div>
    </ExpandableCard>
  )
}

const InlineCondition: FCC<{
  title?: string
}> = ({ title, children }) => (
  <div className="min-w-[5em] text-lg leading-none">
    <span className="text-zinc-500 mr-0.5 tabular-nums font-bold">
      {children}
    </span>
    <span className="text-zinc-400 text-xs">{title}</span>
  </div>
)
