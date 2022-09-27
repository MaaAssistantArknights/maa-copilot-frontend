import { Button, NonIdealState } from '@blueprintjs/core'
import { ErrorBoundary } from '@sentry/react'

import { ComponentType } from 'react'
import { FCC } from 'types'

export const GlobalErrorBoundary: FCC = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <NonIdealState
          icon="issue"
          title="エラー発生"
          description="页面渲染出现错误；请尝试"
          action={
            <Button
              intent="primary"
              icon="refresh"
              onClick={() => window.location.reload()}
            >
              刷新页面
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
