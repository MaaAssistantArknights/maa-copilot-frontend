import { FC } from 'react'

import { SheetContainerSkeleton } from './SheetContainerSkeleton'

interface SheetOperatorProp {}

const SheetOperator: FC<SheetOperatorProp> = () => {
  return <div>111</div>
}

export interface SheetOperatorContainer extends SheetOperatorProp {}

export const SheetOperatorContainer: FC<SheetOperatorProp> = ({
  ...sheetOperatorProps
}) => {
  return (
    <SheetContainerSkeleton title="选择干员" icon="person">
      <SheetOperator {...sheetOperatorProps} />
    </SheetContainerSkeleton>
  )
}
