import { Button, ButtonProps, Card, Elevation } from '@blueprintjs/core'

import clsx from 'clsx'

interface InsertButtonProps extends ButtonProps {}

export const InsertButton = ({ className, ...props }: InsertButtonProps) => (
  <Card
    interactive
    elevation={Elevation.ONE}
    className={clsx(
      'insert-button !p-0 !rounded-full',
      className,
    )}
  >
    <Button small minimal icon="plus" {...props} />
  </Card>
)
