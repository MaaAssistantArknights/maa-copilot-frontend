import { getDefaultStore } from 'jotai/vanilla'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'

import { authAtom } from 'store/auth'
import { TokenManager } from 'utils/token-manager'

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import { FCC } from './types'
import { request } from './utils/fetcher'

// jotai 在没有 Provider 时会使用默认的 store
TokenManager.setAuthGetter(() => getDefaultStore().get(authAtom))
TokenManager.setAuthSetter((v) => getDefaultStore().set(authAtom, v))

export const App: FCC = ({ children }) => {
  return (
    <>
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
