import {
  Classes,
  H6,
  Icon,
  IconName,
  MenuItem,
  MenuItemProps,
} from '@blueprintjs/core'
import { Select2Props } from '@blueprintjs/select'

import clsx from 'clsx'
import { ReactNode } from 'react'
import { FCC } from 'types'

import { Select } from '../Select'

export type DetailedSelectItem = DetailedSelectHeader | DetailedSelectChoice
export type DetailedSelectHeader = {
  type: 'header'
  header: ReactNode | (() => ReactNode)
}

export interface DetailedSelectChoice {
  type: 'choice'
  icon?: IconName
  title: ReactNode | (() => ReactNode)
  value: string | number
  description?: ReactNode | (() => ReactNode)
  disabled?: boolean
  menuItemProps?: Partial<MenuItemProps>
}

export const DetailedSelect: FCC<
  Omit<
    Select2Props<DetailedSelectItem>,
    'itemRenderer' | 'onItemSelect' | 'itemDisabled'
  > & {
    value?: string | number
    onItemSelect: (item: DetailedSelectChoice) => void
  }
> = ({ className, items, value, onItemSelect, children, ...props }) => {
  return (
    <Select
      className={clsx('inline-flex', className)}
      items={items}
      filterable={false}
      resetOnQuery={false}
      itemDisabled={(item) => item.type === 'header' || !!item.disabled}
      itemRenderer={(action, { handleClick, handleFocus, modifiers }) => {
        if (action.type === 'header') {
          return (
            <li key={'header_' + action.header} className={Classes.MENU_HEADER}>
              <H6>
                {typeof action.header === 'function'
                  ? action.header()
                  : action.header}
              </H6>
            </li>
          )
        }

        return (
          <MenuItem
            className={modifiers.active ? Classes.ACTIVE : undefined}
            selected={action.value === value}
            key={action.value}
            onClick={handleClick}
            onFocus={handleFocus}
            multiline
            disabled={action.disabled}
            text={
              <div className="flex items-start">
                {action.icon && (
                  <Icon icon={action.icon} className="pt-0.5 mr-2" />
                )}
                <div className="flex flex-col">
                  <div className="flex-1">
                    {typeof action.title === 'function'
                      ? action.title()
                      : action.title}
                  </div>
                  {action.description && (
                    <div className="text-xs opacity-75">
                      {typeof action.description === 'function'
                        ? action.description()
                        : action.description}
                    </div>
                  )}
                </div>
              </div>
            }
            {...action.menuItemProps}
          />
        )
      }}
      onItemSelect={(item) => {
        item.type === 'choice' && onItemSelect(item)
      }}
      {...props}
    >
      {children}
    </Select>
  )
}

export function isChoice(
  item: DetailedSelectItem,
): item is DetailedSelectChoice {
  return item.type === 'choice'
}
