import { Callout } from '@blueprintjs/core'

import { FieldError, FieldErrors, FieldValues } from 'react-hook-form'

interface FormErrorProps<T extends FieldValues> {
  errors: FieldErrors<T>
}

export const FormError = <T extends FieldValues>({
  errors,
}: FormErrorProps<T>) => {
  const errorsArray = Object.values(errors) as FieldError[]

  if (errorsArray.length === 0) {
    return null
  }

  return (
    <Callout intent="danger" className="mt-2" title="发生错误…">
      <ol className="list-decimal list-inside">
        {errorsArray.map((error, i) => (
          <li key={i}>{error?.message || '未知错误'}</li>
        ))}
      </ol>
    </Callout>
  )
}
