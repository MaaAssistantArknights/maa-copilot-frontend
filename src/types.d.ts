import { FieldErrors, FieldValues, UseFormSetError } from 'react-hook-form'

export type WithChildren<T> = T & { children?: React.ReactNode }
export type FCC<T = {}> = React.FC<WithChildren<T>>

export type Cast<T, U> = T extends U ? T : T & U

export type WithTempId<T = {}> = T & { _id?: string }

export type FieldErrorsWithGlobal<T extends FieldValues = FieldValues> =
  FieldErrors<T & { global: void }>

export type UseFormSetErrorWithGlobal<T extends FieldValues = FieldValues> =
  UseFormSetError<T & { global: void }>
