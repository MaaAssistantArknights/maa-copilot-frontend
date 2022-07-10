import { SWRConfig } from 'swr'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import { FCC } from './types'
import { request } from './utils/fetcher'

export const Root: FCC = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: request,
        suspense: true,
        focusThrottleInterval: 1000 * 60,
        errorRetryInterval: 1000 * 3,
        errorRetryCount: 3,
      }}
    >
      <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
    </SWRConfig>
  )
}
