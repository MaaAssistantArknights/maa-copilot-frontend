import { Button, NonIdealState, Spinner } from '@blueprintjs/core'
import { ErrorBoundary } from '@sentry/react'
import { ComponentType, Suspense } from 'react'
import { FCC } from 'types'

interface SuspensableProps {
  fetcher?: () => void
}

export const Suspensable: FCC<SuspensableProps> = ({ children, fetcher }) => {
  return (
    <ErrorBoundary
      fallback={
        <NonIdealState
          icon="issue"
          title="加载失败"
          description={fetcher && '数据加载失败，请尝试重试'}
          action={
            fetcher && (
              <Button intent="primary" icon="refresh" onClick={fetcher}>
                重试
              </Button>
            )
          }
        />
      }
    >
      <Suspense fallback={<NonIdealState icon={<Spinner />} title="加载中" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export function withSuspensable<P>(
  Component: ComponentType<P>,
  suspensableProps?: SuspensableProps,
): ComponentType<P> {
  const Wrapped: ComponentType<P> = (props) => {
    return (
      <Suspensable {...suspensableProps}>
        <Component {...props} />
      </Suspensable>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withSuspensable(${name})`

  return Wrapped
}
