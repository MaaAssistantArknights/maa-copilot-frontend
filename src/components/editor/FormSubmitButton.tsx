import { Button, IconName } from '@blueprintjs/core'

import { useEffect, useRef, useState } from 'react'
import { Control, FieldValues, useFormState } from 'react-hook-form'

interface FormSubmitButtonProps<T extends FieldValues> {
  className?: string
  control: Control<T>
  icon?: IconName
  children?: React.ReactNode
}

export const FormSubmitButton = <T extends FieldValues>({
  className,
  control,
  icon,
  children,
}: FormSubmitButtonProps<T>) => {
  const { isSubmitSuccessful } = useFormState({ control })

  const [deferredSuccessful, setDeferredSuccessful] = useState(false)
  const resetTimer = useRef(-1)

  useEffect(() => {
    if (isSubmitSuccessful) {
      setDeferredSuccessful(true)

      resetTimer.current = window.setTimeout(() => {
        setDeferredSuccessful(false)
      }, 1000)
    } else {
      setDeferredSuccessful(false)
    }

    return () => {
      clearTimeout(resetTimer.current)
    }
  }, [isSubmitSuccessful])

  return (
    <Button
      className={className}
      intent={deferredSuccessful ? 'success' : 'primary'}
      type="submit"
      icon={deferredSuccessful ? 'tick' : icon}
    >
      {children}
    </Button>
  )
}
