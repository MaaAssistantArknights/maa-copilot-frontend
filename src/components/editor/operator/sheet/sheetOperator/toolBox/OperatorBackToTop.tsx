import { Button } from '@blueprintjs/core'

import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import {
  defaultPagination,
  useOperatorFilterProvider,
} from '../SheetOperatorFilterProvider'

export interface OperatorBackToTopProp {
  toTop: () => void
}

export const OperatorBackToTop: FC<OperatorBackToTopProp> = ({ toTop }) => {
  const { t } = useTranslation()
  const {
    usePaginationFilterState: [{ current }, setPaginationFilter],
  } = useOperatorFilterProvider()

  return (
    <Button
      minimal
      icon="symbol-triangle-up"
      disabled={current < 3}
      title={t(
        'components.editor.operator.sheet.sheetOperator.toolbox.OperatorBackToTop.back_to_top',
      )}
      onClick={() => setPaginationFilter(defaultPagination)}
    />
  )
}
