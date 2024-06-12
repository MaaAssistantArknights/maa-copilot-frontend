import { Card, Elevation, Icon } from '@blueprintjs/core'

import clsx from 'clsx'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { OPERATORS, getSkillUsageTitle } from '../../../models/operator'
import { SortableItemProps } from '../../DND'
import { CardDeleteOption, CardEditOption } from '../CardOptions'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorItemProps extends Partial<SortableItemProps> {
  operator: CopilotDocV1.Operator
  editing?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

export const EditorOperatorItem = ({
  operator,
  editing,
  onEdit,
  onRemove,
  isDragging,
  attributes,
  listeners,
}: EditorOperatorItemProps) => {
  const id = OPERATORS.find(({ name }) => name === operator.name)?.id
  const skillUsage = getSkillUsageTitle(
    operator.skillUsage as CopilotDocV1.SkillUsageType,
    operator.skillTimes,
  )

  const skill = `${
    [null, '一', '二', '三'][operator.skill ?? 1] ?? '未知'
  }技能：${skillUsage}`

  return (
    <Card
      elevation={Elevation.TWO}
      className={clsx(
        'flex items-start',
        editing && 'bg-gray-100',
        isDragging && 'opacity-30',
        'h-[72px] w-[calc(4.5*72px)]',
      )}
    >
      <Icon
        className="cursor-grab active:cursor-grabbing p-1 -mt-1 -ml-2 mr-3 rounded-[1px]"
        icon="drag-handle-vertical"
        {...attributes}
        {...listeners}
      />
      <OperatorAvatar id={id} size="large" />
      <div className="ml-4 flex-grow">
        <h3 className="font-bold leading-none mb-1">{operator.name}</h3>
        <div className="text-gray-400 text-xs">{skill}</div>
      </div>

      <CardEditOption active={editing} onClick={onEdit} />
      <CardDeleteOption className="-mr-3" onClick={onRemove} />
    </Card>
  )
}
