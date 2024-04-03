import { refreshAccessToken } from 'apis/auth'
import { noop } from 'lodash-es'

import { AuthState, fromCredentials } from 'store/auth'
import {
  InvalidTokenError,
  NetworkError,
  TokenExpiredError,
  UnauthorizedError,
} from 'utils/error'

export namespace TokenManager {
  let getAuth: () => AuthState = () => ({})
  let setAuth: (set: AuthState | ((auth: AuthState) => AuthState)) => void =
    noop

  export function setAuthGetter(get: typeof getAuth) {
    getAuth = get
  }
  export function setAuthSetter(set: typeof setAuth) {
    setAuth = set
  }

  let pendingGetToken: Promise<string> | undefined

  export async function updateAndGetToken() {
    if (pendingGetToken) {
      return pendingGetToken
    }

    const { token, validBefore, refreshToken, refreshTokenValidBefore } =
      getAuth()

    const endTime = +new Date(validBefore || 0) || 0
    const refreshEndTime = +new Date(refreshTokenValidBefore || 0) || 0

    pendingGetToken = (async () => {
      if (!token) {
        throw new UnauthorizedError()
      }

      const now = Date.now()

      if (endTime > now) {
        return token
      }

      if (!refreshToken) {
        setAuth({})
        throw new InvalidTokenError()
      }

      if (refreshEndTime > now) {
        try {
          const res = await refreshAccessToken({ refreshToken })

          setAuth(fromCredentials(res))

          return res.token
        } catch (e) {
          if (e instanceof NetworkError) {
            throw e
          }
          throw new TokenExpiredError()
        }
      } else {
        setAuth({})
        throw new InvalidTokenError()
      }
    })()

    // reset when finished, so that the next call will trigger a new check
    pendingGetToken
      .finally(() => {
        pendingGetToken = undefined
      })
      // we still need to catch the error here, otherwise it will be unhandled
      .catch(noop)

    return pendingGetToken
  }
}
