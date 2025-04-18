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
  pendingTitle = '加载中',
  fetcher,
  errorFallback,
}) => {
  const resetError = useRef<() => void>()

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
            title="加载失败"
            description={fetcher ? '数据加载失败，请重试' : error.message}
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
                  重试
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
  const { pendingTitle, retryOnChange = [] } = options

  const SuspensableComponent: FC<P> = (props) => {
    const { t } = useTranslation()
    const resetErrorRef = useRef<(() => void) | undefined>()

    useEffect(
      () => {
        resetErrorRef.current?.()
        resetErrorRef.current = undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      retryOnChange.map((key) => (props as any)[key]),
    )

    const title =
      typeof pendingTitle === 'function'
        ? pendingTitle(t)
        : pendingTitle || t('common.loading')

    return (
      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <div className="flex items-center gap-4">
              <Spinner size={20} />
              <div>{title}</div>
            </div>
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    )
  }

  // Debug
  SuspensableComponent.displayName = `Suspensable(${
    Component.displayName || Component.name || 'Component'
  })`

  return SuspensableComponent
}
