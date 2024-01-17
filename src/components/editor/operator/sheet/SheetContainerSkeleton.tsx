import {
  Divider,
  H3,
  H4,
  Icon,
  IconName,
  MaybeElement,
} from '@blueprintjs/core'

import { ReactNode } from 'react'

interface SheetContainerSkeletonProps {
  title: string
  icon: IconName | MaybeElement
  mini?: boolean
  children: ReactNode
}

export const SheetContainerSkeleton = ({
  title,
  icon,
  children,
  mini,
}: SheetContainerSkeletonProps) => (
  <div>
    <div className="flex items-center pl-3 my-5">
      <div className="flex items-center">
        <Icon icon={icon} size={mini ? 16 : 20} />
        {mini ? (
          <H4 className="p-0 m-0 ml-3">{title}</H4>
        ) : (
          <H3 className="p-0 m-0 ml-3">{title}</H3>
        )}
      </div>
    </div>
    {!mini && <Divider />}
    {children}
  </div>
)
