import { Button } from '@blueprintjs/core'

import { useController } from 'react-hook-form'

import {
  DetailedSelect,
  DetailedSelectChoice,
  DetailedSelectItem,
} from 'components/editor/DetailedSelect'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { operatorSkillUsages } from '../../../models/operator'

export const EditorOperatorSkillUsage = ({
  name,
  control,
  ...controllerProps
}: EditorFieldProps<CopilotDocV1.Operation, CopilotDocV1.SkillUsageType>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    ...controllerProps,
  })

  const selectedAction = operatorSkillUsages.find(
    (action) => action.type === 'choice' && action.value === (value ?? 0),
  ) as DetailedSelectChoice | undefined

  return (
    <DetailedSelect
      items={operatorSkillUsages as DetailedSelectItem[]}
      onItemSelect={(item) => {
        onChange(item.value)
      }}
      activeItem={selectedAction}
    >
      <Button
        icon={selectedAction?.icon || 'slash'}
        text={selectedAction ? selectedAction.title : '选择技能用法'}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </DetailedSelect>
  )
}
