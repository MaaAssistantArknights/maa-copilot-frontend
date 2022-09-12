import { Card, Elevation, Icon } from '@blueprintjs/core'
import clsx from 'clsx'
import { OPERATORS } from '../../../models/generated/operators'
import { findOperatorSkillUsage } from '../../../models/operator'
import { SortableItemProps } from '../../dnd'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorItemProps extends Partial<SortableItemProps> {
  operator: CopilotDocV1.Operator
}

export const EditorOperatorItem = ({
  operator,
  isDragging,
  attributes,
  listeners,
}: EditorOperatorItemProps) => {
  const id = OPERATORS.find(({ name }) => name === operator.name)?.id
  const skillUsage = findOperatorSkillUsage(operator.skillUsage)?.title

  const skill = `${
    [null, '一', '二', '三'][operator.skill ?? 1] ?? '未知'
  }技能：${skillUsage}`

  return (
    <Card
      elevation={Elevation.TWO}
      className={clsx('flex', isDragging && 'opacity-30')}
    >
      <Icon
        className="cursor-grab active:cursor-grabbing p-1 -my-1 -ml-2 mr-3 rounded-[1px]"
        icon="drag-handle-vertical"
        {...attributes}
        {...listeners}
      />
      <OperatorAvatar id={id} size="large" />
      <div className="ml-4">
        <h3 className="font-bold leading-none mb-1">{operator.name}</h3>
        <div className="text-gray-400">{skill}</div>
      </div>
    </Card>
  )
}
