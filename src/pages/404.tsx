import { Button, NonIdealState } from '@blueprintjs/core'

import { ComponentType } from 'react'
import { Link } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'

import { useTranslation } from '../i18n/i18n'

export const NotFoundPage: ComponentType = withGlobalErrorBoundary(() => {
  const t = useTranslation()

  return (
    <NonIdealState
      className="py-16"
      icon="slash"
      title={t.pages._404.page_not_found}
      description={t.pages._404.check_url}
      action={
        <Link to="/">
          <Button intent="primary" text={t.pages._404.return_home} />
        </Link>
      }
    />
  )
})
