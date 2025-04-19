import { Button, NonIdealState } from '@blueprintjs/core'
import { ErrorBoundary } from '@sentry/react'

import { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { FCC } from 'types'

export const GlobalErrorBoundary: FCC = ({ children }) => {
  const { t } = useTranslation()
  return (
    <ErrorBoundary
      fallback={
        <NonIdealState
          icon="issue"
          title={t('components.GlobalErrorBoundary.error_occurred')}
          description={t('components.GlobalErrorBoundary.render_error')}
          action={
            <Button
              intent="primary"
              icon="refresh"
              onClick={() => window.location.reload()}
            >
              {t('components.GlobalErrorBoundary.refresh_page')}
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function withGlobalErrorBoundary<P extends {}>(
  Component: ComponentType<P>,
): ComponentType<P> {
  const Wrapped: ComponentType<P> = (props) => {
    return (
      <GlobalErrorBoundary>
        <Component {...props} />
      </GlobalErrorBoundary>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withGlobalErrorBoundary(${name})`

  return Wrapped
}
