import { Button, ButtonProps, Label } from '@blueprintjs/core'
import { Select2, Select2Props } from '@blueprintjs/select'

import clsx from 'clsx'

interface SelectProps<T> extends Select2Props<T> {
  selectedItem?: T
  resetButtonProps?: ButtonProps
  onReset?: () => void
}

export const Select = <T,>({
  className,
  selectedItem,
  onReset,
  resetButtonProps,
  inputProps,
  ...props
}: SelectProps<T>) => {
  const canReset = selectedItem !== undefined

  return (
    <Label className={clsx('!flex items-center !mb-0', className)}>
      <Select2
        className="!mt-0"
        resetOnQuery={false} // 这个功能有无限 reset 的 bug，不要用
        inputProps={{
          ...inputProps,
          className: clsx(
            '[&_.bp4-input]:rounded-md [&_.bp4-icon-search]:!m-[7px] [&_.bp4-button]:!p-[0_7px]',
            inputProps?.className,
          ),
        }}
        {...props}
      />
      {canReset && (
        <Button
          small
          minimal
          icon="cross"
          {...resetButtonProps}
          onClick={(e) => {
            // 因为在 Label 内，不阻止的话会再次展开 Select
            e.preventDefault()

            onReset?.()
          }}
        />
      )}
    </Label>
  )
}
