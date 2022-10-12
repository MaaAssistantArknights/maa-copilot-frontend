import { Button, ButtonProps, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { FC } from 'react'

export const CardDuplicateOption: FC<ButtonProps> = ({
  className,
  ...props
}) => (
  <Button
    minimal
    icon="duplicate"
    title="复制"
    className={clsx('-my-2', className)}
    {...props}
  />
)

export const CardEditOption: FC<ButtonProps> = ({ className, ...props }) => (
  <Button
    minimal
    icon="edit"
    title="编辑"
    className={clsx('-my-2', className)}
    {...props}
  />
)

export const CardDeleteOption: FC<ButtonProps> = ({
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
      title="删除"
      className={clsx('-my-2', className)}
      {...props}
    />
  </Popover2>
)
