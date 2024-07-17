import { Button } from '@blueprintjs/core'

import { FC } from 'react'

import { useOperatorFilterProvider } from '../SheetOperatorFilterProvider'
import { defaultPagination } from '../ShowMore'

export interface OperatorBackToTopProp {
  toTop: () => void
}

export const OperatorBackToTop: FC<OperatorBackToTopProp> = ({ toTop }) => {
  const {
    usePaginationFilterState: [{ current }, setPaginationFilter],
  } = useOperatorFilterProvider()

  return (
    <Button
      minimal
      icon="symbol-triangle-up"
      disabled={current < 3}
      title="回到顶部"
      onClick={() => setPaginationFilter(defaultPagination)}
    />
  )
}
