import { Divider, H3, Icon, IconName, MaybeElement } from '@blueprintjs/core'

import { ReactNode } from 'react'

interface SheetContainerSkeletonProps {
  title: string
  icon: IconName | MaybeElement
  children: ReactNode
}

export const SheetContainerSkeleton = ({
  title,
  icon,
  children,
}: SheetContainerSkeletonProps) => (
  <div>
    <div className="flex items-center pl-3 my-5">
      <div className="flex items-center">
        <Icon icon={icon} size={20} />
        <H3 className="p-0 m-0 ml-3">{title}</H3>
      </div>
    </div>
    <Divider />
    {children}
  </div>
)
