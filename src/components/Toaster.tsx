import { IToasterProps, Position, Toaster } from '@blueprintjs/core'

export const AppToaster = (props?: IToasterProps) =>
  Toaster.create({
    position: Position.BOTTOM_LEFT,
    ...props,
  })
