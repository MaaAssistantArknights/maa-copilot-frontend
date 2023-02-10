import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'

import { Effects } from 'components/Effects'

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import { FCC } from './types'
import { request } from './utils/fetcher'
import { localStorageProvider, swrCacheMiddleware } from './utils/swr-cache'

export const App: FCC = ({ children }) => {
  return (
    <>
      <Effects />
      <SWRConfig
        value={{
          fetcher: request,
          provider: localStorageProvider,
          suspense: true,
          focusThrottleInterval: 1000 * 60,
          errorRetryInterval: 1000 * 3,
          errorRetryCount: 3,
          use: [swrCacheMiddleware],
        }}
      >
        <GlobalErrorBoundary>
          <BrowserRouter>{children}</BrowserRouter>
        </GlobalErrorBoundary>
      </SWRConfig>
    </>
  )
}
