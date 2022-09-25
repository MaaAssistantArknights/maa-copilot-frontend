import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { EditorIntegerInput } from 'components/editor/EditorIntegerInput'
import { useFormState } from 'react-hook-form'
import { SetOptional } from 'type-fest'
import { FormField2 } from '../../FormField'

interface EditorActionExecPredicateProps
  extends SetOptional<EditorFieldProps<CopilotDocV1.Action, number>, 'name'> {}

export const EditorActionExecPredicateKills = ({
  name = 'kills',
  control,
  ...controllerProps
}: EditorActionExecPredicateProps) => {
  const { errors } = useFormState({ control, name })

  return (
    <FormField2
      label="击杀数条件"
      className="mr-2 lg:mr-4"
      field={name}
      error={errors[name]}
      description="如果没达到就一直等待。可选，默认为 0，直接执行"
    >
      <EditorIntegerInput
        NumericInputProps={{ placeholder: '击杀数' }}
        control={control}
        name={name}
        {...controllerProps}
      />
    </FormField2>
  )
}

export const EditorActionExecPredicateCostChange = ({
  name = 'costChanges',
  control,
  ...controllerProps
}: EditorActionExecPredicateProps) => {
  const { errors } = useFormState({ control, name })

  return (
    <FormField2
      label="费用变化量条件"
      className="mr-2 lg:mr-4"
      field={name}
      error={errors[name]}
      description="如果没达到就一直等待。可选，默认为 0，直接执行。注意：费用变化量是从开始执行本动作时开始计算的（即：使用前一个动作结束时的费用作为基准）；另外仅在费用是两位数的时候识别的比较准，三位数的费用可能会识别错，不推荐使用"
    >
      <EditorIntegerInput
        NumericInputProps={{ placeholder: '费用变化量' }}
        control={control}
        name={name}
        {...controllerProps}
      />
    </FormField2>
  )
}

export const EditorActionExecPredicateCooling = ({
  name = 'cooling',
  control,
  ...controllerProps
}: EditorActionExecPredicateProps) => {
  const { errors } = useFormState({ control, name })

  return (
    <FormField2
      label="CD 中干员数量条件"
      field={name}
      error={errors[name]}
      description="如果没达到就一直等待。可选，默认 -1，不识别"
    >
      <EditorIntegerInput
        NumericInputProps={{ placeholder: 'CD 中干员数量' }}
        control={control}
        name={name}
        {...controllerProps}
      />
    </FormField2>
  )
}
