import { NumericInputProps } from '@blueprintjs/core'

import { isNil } from 'lodash-es'
import { FieldValues, useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'

import { FieldResetButton } from '../FieldResetButton'
import { NumericInput2 } from './NumericInput2'

export interface EditorIntegerInputProps<T extends FieldValues>
  extends EditorFieldProps<T, number> {
  NumericInputProps: Omit<
    NumericInputProps,
    'name' | 'inputRef' | 'onValueChange' | 'onBlur'
  >
}

export const EditorIntegerInput = <T extends FieldValues>({
  name,
  control,
  rules,
  NumericInputProps,
  ...controllerProps
}: EditorIntegerInputProps<T>) => {
  const { min } = NumericInputProps

  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { isDirty },
  } = useController({
    name,
    control,
    ...controllerProps,
    rules: {
      min: isNil(min) ? undefined : { value: min, message: '最小为 ${min}' },
      ...rules,
    },
  })

  return (
    <NumericInput2
      intOnly
      selectAllOnFocus
      minorStepSize={null}
      name={name}
      inputRef={ref}
      onValueChange={(value) => onChange(value)}
      onBlur={onBlur}
      value={value ?? ''}
      rightElement={
        <FieldResetButton
          disabled={!isDirty}
          onReset={() => onChange(undefined)}
        />
      }
      {...NumericInputProps}
    />
  )
}
