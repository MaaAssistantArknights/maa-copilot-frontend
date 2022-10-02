import { NumericInput, NumericInputProps } from '@blueprintjs/core'

import { FieldValues, useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'

import { FieldResetButton } from '../FieldResetButton'

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
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    ...controllerProps,
    rules: { min: { value: 0, message: '最小为 0' }, ...rules },
  })

  return (
    <NumericInput
      selectAllOnFocus
      minorStepSize={null}
      min={0}
      name={name}
      inputRef={ref}
      onValueChange={(value) => {
        if (
          !Number.isNaN(value) &&
          Number.isFinite(value) &&
          Number.isSafeInteger(value)
        ) {
          onChange(value)
        }
      }}
      onBlur={onBlur}
      value={value ?? ''}
      rightElement={<FieldResetButton value={value} onReset={onChange} />}
      // seems that NumericInput component have a bug where if
      // passed an undefined value, it's just simply not gonna update anymore...
      {...NumericInputProps}
    />
  )
}
