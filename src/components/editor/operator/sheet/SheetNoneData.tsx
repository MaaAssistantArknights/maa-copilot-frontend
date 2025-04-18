import { NonIdealState } from '@blueprintjs/core'

import { useTranslation } from 'react-i18next'

export const OperatorNoData = () => {
  const { t } = useTranslation()
  return (
    <NonIdealState
      title={t('components.editor.operator.sheet.SheetNoneData.no_operators')}
    />
  )
}

export const GroupNoData = () => {
  const { t } = useTranslation()
  return (
    <NonIdealState
      title={t('components.editor.operator.sheet.SheetNoneData.no_groups')}
    />
  )
}
