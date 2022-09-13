import {
  ArrayPath,
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UseControllerProps,
} from 'react-hook-form'
import { Cast } from '../../types'

type PathOfType<T, P extends Path<T> | ArrayPath<T>, U> = P extends any
  ? PathValue<T, P> extends U
    ? P
    : never
  : never

export interface EditorFieldProps<
  TFieldValues extends FieldValues,
  TType = any,
> extends UseControllerProps<
    TFieldValues,
    string extends keyof TFieldValues
      ? never
      : // the Cast here is a workaround for the fact that TS cannot correctly recognize
        // that ConditionalPick returns a subset of TFieldValues
        // refer to: https://github.com/microsoft/TypeScript/issues/46855#issuecomment-974484444
        Cast<
          PathOfType<
            // wrap in Require to prevent optional keys from being stripped
            Required<TFieldValues>,
            FieldPath<Required<TFieldValues>>,
            TType
          >,
          FieldPath<TFieldValues>
        >
  > {}

export interface EditorFieldPropsByName<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  error?: any
}
