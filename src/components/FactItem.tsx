import { Icon, IconName } from '@blueprintjs/core'
import { ReactNode } from 'react'
import { FCC } from 'types'

export const FactItem: FCC<{
  icon?: IconName
  title?: ReactNode
}> = ({ icon, title, children }) => (
  <div className="flex items-center mb-4 last:mb-0">
    {icon && <Icon icon={icon} className="mr-2 text-zinc-600" />}
    <div className="text-sm mr-2">{title}</div>
    {children}
  </div>
)
