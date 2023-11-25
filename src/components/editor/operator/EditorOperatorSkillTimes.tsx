import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { NumericInput2 } from '../NumericInput2'

export const EditorOperatorSkillTimes = <
  T extends CopilotDocV1.Operator | CopilotDocV1.ActionSkillTimes,
>({
  name,
  control,
  ...controllerProps
}: EditorFieldProps<T, CopilotDocV1.SkillTimes>) => {
  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
    ...controllerProps,
  })

  return (
    <NumericInput2
      defaultValue={0}
      onValueChange={(val) => onChange(Math.min(val, 100))}
      onBlur={onBlur}
      placeholder="技能使用次数"
      value={value ?? ''}
      large
      min={1}
      max={100}
    />
  )
}
