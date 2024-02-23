import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { FieldResetButton } from '../../FieldResetButton'
import { FormField2 } from '../../FormField'
import { NumericInput2 } from '../NumericInput2'

interface EditorActionDistanceProps
  extends EditorFieldProps<CopilotDocV1.Action, [number, number]> {}

export const EditorActionDistance = ({
  name,
  control,
  rules,
  ...controllerProps
}: EditorActionDistanceProps) => {
  const {
    field: { onChange, onBlur, value },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: {
      required: '必须填写移动距离',
      validate: (v) => {
        // v being undefined is allowed because the `required` rule will handle it properly
        if (v) {
          if (
            !(
              Array.isArray(v) &&
              v.length === 2 &&
              v.every((i) => Number.isFinite(i))
            )
          ) {
            return '不是有效的数字'
          }
        }
        return undefined
      },
      ...rules,
    },
    ...controllerProps,
  })

  const transform: Record<
    string,
    (v?: number) => [number | undefined, number | undefined]
  > = {
    fromX: (v) => [v, value?.[1]],
    fromY: (v) => [value?.[0], v],
  }

  const reset = (value: [number | undefined, number | undefined]) => {
    // if both are reset, reset the entire field
    if (value[0] === undefined && value[1] === undefined) {
      onChange(undefined)
    } else {
      onChange(value)
    }
  }

  return (
    <FormField2
      asterisk
      label="移动距离"
      field={name}
      error={errors[name]}
      className="mr-4"
    >
      <div className="flex">
        <NumericInput2
          selectAllOnFocus
          className="mr-2"
          placeholder="X 距离"
          stepSize={0.5}
          onValueChange={(value) => onChange(transform.fromX(value))}
          onBlur={onBlur}
          value={value?.[0]?.toString() ?? ''}
          rightElement={
            <FieldResetButton
              disabled={value?.[0] === undefined}
              onReset={() => reset(transform.fromX(undefined))}
            />
          }
        />

        <NumericInput2
          selectAllOnFocus
          placeholder="Y 距离"
          stepSize={0.5}
          onValueChange={(value) => onChange(transform.fromY(value))}
          onBlur={onBlur}
          value={value?.[1]?.toString() ?? ''}
          rightElement={
            <FieldResetButton
              disabled={value?.[1] === undefined}
              onReset={() => reset(transform.fromY(undefined))}
            />
          }
        />
      </div>
    </FormField2>
  )
}
