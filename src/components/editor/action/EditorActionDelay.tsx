import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { EditorIntegerInput } from 'components/editor/EditorIntegerInput'
import { useFormState } from 'react-hook-form'
import { SetOptional } from 'type-fest'
import { FormField2 } from '../../FormField'

interface EditorActionDelayProps
  extends SetOptional<EditorFieldProps<CopilotDocV1.Action, number>, 'name'> {}

export const EditorActionPreDelay = ({
  name = 'preDelay',
  control,
  rules,
}: EditorActionDelayProps) => {
  const { errors } = useFormState({ control, name })

  return (
    <FormField2
      label="前置延时"
      className="mr-2 lg:mr-4"
      field={name}
      error={errors[name]}
      description="可选，默认为 0，单位毫秒"
    >
      <EditorIntegerInput
        NumericInputProps={{
          placeholder: '前置延时',
          stepSize: 100,
          minorStepSize: 10,
          majorStepSize: 1000,
        }}
        control={control}
        name={name}
        rules={rules}
      />
    </FormField2>
  )
}

export const EditorActionRearDelay = ({
  name = 'rearDelay',
  control,
  rules,
}: EditorActionDelayProps) => {
  const { errors } = useFormState({ control, name })

  return (
    <FormField2
      label="后置延时"
      field={name}
      error={errors[name]}
      description="可选，默认为 0，单位毫秒"
    >
      <EditorIntegerInput
        NumericInputProps={{
          placeholder: '后置延时',
          stepSize: 100,
          minorStepSize: 10,
          majorStepSize: 1000,
        }}
        control={control}
        name={name}
        rules={rules}
      />
    </FormField2>
  )
}
