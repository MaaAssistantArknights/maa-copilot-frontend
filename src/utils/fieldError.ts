import { FieldValues, Path, UseFormSetError } from 'react-hook-form'

export class FieldError extends Error {
  constructor(public field: string, message: string) {
    super(message)
  }
}

export function handleFieldError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
) {
  if (error instanceof FieldError) {
    setError(error.field as Path<T>, { message: error.message })
  }
}
