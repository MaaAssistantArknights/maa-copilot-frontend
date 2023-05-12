import { Icon, IconName } from '@blueprintjs/core'

import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { FCC } from 'types'

import { FactItem } from 'components/FactItem'

export const EditorActionModule: FCC<{
  icon?: IconName
  title?: ReactNode
  dense?: boolean
  relaxed?: boolean
  className?: string
}> = ({ children, ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <>
      <FactItem {...props}>
        {
          <Icon
            icon="chevron-up"
            className={clsx(
              'mr-2 text-zinc-500 ml-auto transition-transform cursor-pointer',
              isCollapsed && 'rotate-180',
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        }
      </FactItem>
      <div
        className={clsx(
          'overflow-hidden transition-[max-height] duration-[300ms]',
          isCollapsed ? 'max-h-0' : 'max-h-[499px]',
        )}
      >
        {children}
      </div>
    </>
  )
}
