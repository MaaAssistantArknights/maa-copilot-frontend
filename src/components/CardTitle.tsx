import { H4, Icon, IconName } from '@blueprintjs/core'
import clsx from 'clsx'
import { FCC } from 'types'

export const CardTitle: FCC<{
  icon?: IconName
  large?: boolean
  className?: string
}> = ({ icon, large, className, children }) => {
  return (
    <H4 className={clsx('text-gray-700 flex items-center', className)}>
      {icon && <Icon icon={icon} className="mr-2" size={large ? 20 : 16} />}
      {children}
    </H4>
  )
}
