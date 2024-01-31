import { atom } from 'jotai'

import { UserCredentials } from '../apis/auth'
import { atomWithLocalStorage } from './storage'

interface AuthState {
  token?: string
  validBefore?: string
  refreshToken?: string
  refreshTokenValidBefore?: string

  activated?: boolean
  role?: string
  userId?: string
  username?: string
}

const authCoreAtom = atomWithLocalStorage<AuthState, AuthState>(
  'maa-copilot-auth',
  {},
)

export const authAtom = atom(
  (get) => get(authCoreAtom),
  (_get, set, value: AuthState) => {
    set(authCoreAtom, value)
  },
)

export function fromCredentials(credentials: UserCredentials): AuthState {
  return {
    token: credentials.token,
    validBefore: credentials.validBefore,
    refreshToken: credentials.refreshToken,
    refreshTokenValidBefore: credentials.refreshTokenValidBefore,
    activated: credentials.userInfo.activated,
    role: credentials.userInfo.role,
    userId: credentials.userInfo.id,
    username: credentials.userInfo.userName,
  }
}
