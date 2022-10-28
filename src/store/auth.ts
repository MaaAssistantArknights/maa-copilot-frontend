import { atom } from 'jotai'

import { atomWithLocalStorage } from './storage'

interface AuthState {
  token?: string

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
