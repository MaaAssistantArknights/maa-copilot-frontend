import { Button, NonIdealState, Spinner } from '@blueprintjs/core'
import { ErrorBoundary } from '@sentry/react'

import { TFunction } from 'i18next'
import { ComponentType, FC, Suspense, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FCC } from 'types'

interface SuspensableProps {
  // deps that will cause the Suspense's error to reset
  retryDeps?: readonly any[]

  pendingTitle?: string

  fetcher?: () => void
  errorFallback?: (params: { error: Error }) => JSX.Element | undefined
}

export const Suspensable: FCC<SuspensableProps> = ({
  children,
  retryDeps = [],
  pendingTitle,
  fetcher,
  errorFallback,
}) => {
  const resetError = useRef<() => void>()
  const { t } = useTranslation()

  pendingTitle = pendingTitle ?? t('components.Suspensable.loading')

  useEffect(() => {
    resetError.current?.()
    resetError.current = undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, retryDeps)

  return (
    <ErrorBoundary
      fallback={({ resetError: _resetError, error }) => {
        const fallback = errorFallback?.({ error })
        if (fallback !== undefined) {
          return fallback
        }

        resetError.current = _resetError

        return (
          <NonIdealState
            icon="issue"
            title={t('components.Suspensable.loadFailed')}
            description={
              fetcher
                ? t('components.Suspensable.dataLoadFailedRetry')
                : error.message
            }
            className="py-8"
            action={
              fetcher && (
                <Button
                  intent="primary"
                  icon="refresh"
                  onClick={() => {
                    _resetError()
                    resetError.current = undefined
                    fetcher()
                  }}
                >
                  {t('components.Suspensable.retry')}
                </Button>
              )
            }
          />
        )
      }}
    >
      <Suspense
        fallback={
          <NonIdealState
            icon={<Spinner />}
            title={pendingTitle}
            className="py-8"
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

interface SuspensableOptions {
  pendingTitle?: string | ((t: TFunction) => string)
  retryOnChange?: string[]
  errorFallback?: (params: {
    error: Error
    resetError: () => void
  }) => JSX.Element | undefined
}

export function withSuspensable<P extends object>(
  Component: ComponentType<P>,
  options: SuspensableOptions = {},
): FC<P> {
  const { pendingTitle, retryOnChange = [], errorFallback } = options

  const SuspensableComponent: FC<P> = (props) => {
    const retryDeps = retryOnChange.map((key) => (props as any)[key])

    return (
      <Suspensable
        pendingTitle={
          typeof pendingTitle === 'function'
            ? pendingTitle(useTranslation().t)
            : pendingTitle
        }
        retryDeps={retryDeps}
        errorFallback={({ error }) =>
          errorFallback
            ? errorFallback({ error, resetError: () => {} })
            : undefined
        }
      >
        <Component {...props} />
      </Suspensable>
    )
  }

  // Format for display in DevTools
  SuspensableComponent.displayName = `Suspensable(${
    Component.displayName || Component.name || 'Component'
  })`

  return SuspensableComponent
}
