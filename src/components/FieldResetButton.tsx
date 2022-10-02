import { Button, ButtonProps } from '@blueprintjs/core'

import clsx from 'clsx'

interface FieldResetButtonProps<T> extends ButtonProps {
  value?: T
  onReset: (value: undefined) => void
}

export const FieldResetButton = <T,>({
  value,
  onReset,
  ...buttonProps
}: FieldResetButtonProps<T>) => {
  return (
    <Button
      small
      minimal
      className={clsx(
        'invisible',
        value !== undefined && '[.bp4-input-group:hover_&]:visible',
      )}
      icon="cross"
      onClick={() => onReset(undefined)}
      {...buttonProps}
    />
  )
}
