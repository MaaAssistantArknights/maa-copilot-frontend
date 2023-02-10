import { useAtom } from 'jotai'
import { FC, useRef } from 'react'

import { authAtom, fromCredentials } from 'store/auth'
import { FETCHER_CONFIG } from 'utils/fetcher'

import { requestRefresh } from '../apis/auth'
import { formatError } from '../utils/error'
import { AppToaster } from './Toaster'

export const Effects: FC = () => {
  const [auth, setAuth] = useAtom(authAtom)
  const lastAuth = useRef<typeof auth | null>(null)

  // here we are simulating a synchronous version of useEffect(() => {}, [auth])
  // in order to set the FETCHER_CONFIG.apiToken before any useSWR() call,
  // because useSWR() seems to send request synchronously, and useEffect() is too late
  if (lastAuth.current !== auth) {
    lastAuth.current = auth

    const { token, validBefore, refreshToken, refreshTokenValidBefore } = auth

    const endTime = +new Date(validBefore || 0) || 0
    const refreshEndTime = +new Date(refreshTokenValidBefore || 0) || 0

    let currentPromise: Promise<string | undefined> | undefined = undefined

    const currentFn = () => {
      if (!currentPromise) {
        currentPromise = (async () => {
          let shouldLogout = false

          const now = Date.now()

          if (token) {
            if (endTime > now) {
              return token
            }

            if (!refreshToken) {
              // the refresh token is somehow missing, no way to update the token
              shouldLogout = true
            }
          }

          if (refreshToken) {
            if (refreshEndTime > now) {
              try {
                const res = await requestRefresh(token || '', refreshToken)

                // handle a race condition where we have updated the apiToken function while the current one is running,
                // in such case we call and return the newest function in order to return the newest value (possibly undefined)
                if (currentFn !== FETCHER_CONFIG.apiToken) {
                  return FETCHER_CONFIG.apiToken?.()
                }

                setAuth(fromCredentials(res.data))

                return res.data.token
              } catch (e) {
                console.warn(e)

                // do not logout here, let the user decide
                AppToaster.show({
                  intent: 'warning',
                  message: '登录失效：' + formatError(e),
                })
              }
            } else {
              shouldLogout = true
            }
          }

          if (shouldLogout) {
            // FIXME: setting the state synchronously may cause problems (not really sure), so we add a small delay for a temporary hack
            await new Promise((resolve) => setTimeout(resolve, 50))

            setAuth({})
            AppToaster.show({
              intent: 'warning',
              message: '登录已过期，请重新登录',
            })
          }

          return undefined
        })()

        // clear it after finished, so that the next call will trigger a new check
        currentPromise.then(() => (currentPromise = undefined))
      }

      return currentPromise
    }

    FETCHER_CONFIG.apiToken = currentFn
  }

  return null
}
