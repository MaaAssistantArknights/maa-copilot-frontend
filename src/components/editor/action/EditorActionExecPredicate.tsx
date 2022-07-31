import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import {
  EditorIntegerInput,
  EditorIntegerInputProps,
} from 'components/editor/EditorIntegerInput'

interface EditorActionExecPredicateProps<T> extends EditorFieldProps<T> {
  NumericInputProps?: Omit<
    EditorIntegerInputProps<T>['NumericInputProps'],
    'placeholder'
  >
}

export const EditorActionExecPredicateKills = <T,>({
  name,
  control,
  NumericInputProps,
}: EditorActionExecPredicateProps<T>) => (
  <EditorIntegerInput
    NumericInputProps={{ placeholder: '击杀数', ...NumericInputProps }}
    control={control}
    name={name}
  />
)

export const EditorActionExecPredicateCostChange = <T,>({
  name,
  control,
  NumericInputProps,
}: EditorActionExecPredicateProps<T>) => (
  <EditorIntegerInput
    NumericInputProps={{ placeholder: '费用变化量', ...NumericInputProps }}
    control={control}
    name={name}
  />
)
