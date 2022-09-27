import { Button, ButtonProps, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { FC } from 'react'

interface CardEditOptionProps extends ButtonProps {}
interface CardDeleteOptionProps extends ButtonProps {}

export const CardEditOption: FC<CardEditOptionProps> = ({
  className,
  ...props
}) => (
  <Button minimal icon="edit" className={clsx('-my-2', className)} {...props} />
)

export const CardDeleteOption: FC<CardDeleteOptionProps> = ({
  className,
  onClick,
  ...props
}) => (
  <Popover2
    position="right"
    content={
      <Menu className="p-0">
        <MenuItem intent="danger" text="删除" icon="trash" onClick={onClick} />
      </Menu>
    }
  >
    <Button
      minimal
      icon="trash"
      className={clsx('-my-2', className)}
      {...props}
    />
  </Popover2>
)
