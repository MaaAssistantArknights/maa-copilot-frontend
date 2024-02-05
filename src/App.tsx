import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'

import { Effects } from 'components/Effects'

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import { FCC } from './types'
import { request } from './utils/fetcher'

export const App: FCC = ({ children }) => {
  return (
    <>
      <Effects />
      <SWRConfig
        value={{
          fetcher: request,
          focusThrottleInterval: 1000 * 60,
          errorRetryInterval: 1000 * 3,
          errorRetryCount: 3,
        }}
      >
        <GlobalErrorBoundary>
          <BrowserRouter>{children}</BrowserRouter>
        </GlobalErrorBoundary>
      </SWRConfig>
    </>
  )
}
