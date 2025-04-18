import { Button, NonIdealState } from '@blueprintjs/core'

import { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'

export const NotFoundPage: ComponentType = withGlobalErrorBoundary(() => {
  const { t } = useTranslation()

  return (
    <NonIdealState
      className="py-16"
      icon="slash"
      title={t('pages.404.page_not_found')}
      description={t('pages.404.check_url')}
      action={
        <Link to="/">
          <Button intent="primary" text={t('pages.404.return_home')} />
        </Link>
      }
    />
  )
})
