import { Icon, Tag } from '@blueprintjs/core'

import { useState } from 'react'
import { useWatch } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { OPERATORS } from '../../../models/generated/operators'
import { findOperatorSkillUsage } from '../../../models/operator'
import { SortableItemProps } from '../../dnd'
import { CardDeleteOption } from '../CardOptions'
import { EditorFieldProps } from '../EditorFieldProps'
import { ExpandableCard } from '../ExpandableCard'
import { defaultOperator } from '../utils/defaults'
import { getFirstError, useEditorForm } from '../utils/form'
import { OperatorAvatar } from './EditorOperator'
import { EditorOperatorForm } from './EditorOperatorForm'

interface EditorOperatorItemProps
  extends EditorFieldProps<CopilotDocV1.Operation, CopilotDocV1.Operator>,
    Partial<SortableItemProps> {
  onRemove?: () => void
}

export const EditorOperatorItem = ({
  name,
  onRemove,
  attributes,
  listeners,
}: EditorOperatorItemProps) => {
  const {
    control,
    formState: { errors },
  } = useEditorForm()

  const operator = useWatch({
    control,
    name,
    // this will always be returned on first render
    defaultValue: defaultOperator,
  }) as CopilotDocV1.Operator

  const id = OPERATORS.find(({ name }) => name === operator.name)?.id
  const skillUsage = findOperatorSkillUsage(operator.skillUsage).title

  const skill = `${
    [null, '一', '二', '三'][operator.skill ?? 1] ?? '未知'
  }技能：${skillUsage}`

  const [expand, setExpand] = useState(false)

  const error = getFirstError(errors, name)

  return (
    <ExpandableCard
      expand={expand}
      setExpand={setExpand}
      content={<EditorOperatorForm name={name} />}
    >
      <div className="flex items-start">
        <Icon
          className="cursor-grab active:cursor-grabbing p-1 -mt-1 -ml-2 mr-3 rounded-[1px]"
          icon="drag-handle-vertical"
          {...attributes}
          {...listeners}
        />
        <OperatorAvatar id={id} size="large" />
        <div className="ml-4 flex-grow">
          <h3 className="font-bold leading-none mb-1">
            <span>{operator.name}</span>
            {error && (
              <Tag minimal intent="danger">
                {error}
              </Tag>
            )}
          </h3>
          <div className="text-gray-400">{skill}</div>
        </div>

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={(e) => e.stopPropagation()}>
          <CardDeleteOption className="-mr-3" onClick={onRemove} />
        </div>
      </div>
    </ExpandableCard>
  )
}
