import { Card, Elevation } from '@blueprintjs/core'
import { OPERATORS } from '../../../models/generated/operators'
import { findOperatorSkillUsage } from '../../../models/operator'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorItemProps {
  operator: CopilotDocV1.Operator
}

export const EditorOperatorItem = ({ operator }: EditorOperatorItemProps) => {
  const id = OPERATORS.find(({ name }) => name === operator.name)?.id
  const skillUsage = findOperatorSkillUsage(operator.skillUsage)?.title

  const skill = `${
    [null, '一', '二', '三'][operator.skill ?? 1] ?? '未知'
  }技能：${skillUsage}`

  return (
    <Card elevation={Elevation.TWO} className="flex">
      <OperatorAvatar id={id} size="large" />
      <div className="ml-4">
        <h3 className="font-bold leading-none mb-1">{operator.name}</h3>
        <div className="text-gray-400">{skill}</div>
      </div>
    </Card>
  )
}
