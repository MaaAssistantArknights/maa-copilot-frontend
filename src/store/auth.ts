import { WritableAtom, atom } from 'jotai'

interface AuthState {
  token?: string

  activated?: boolean
  role?: string
  userId?: string
  username?: string
}

const atomWithLocalStorage = <T, W>(
  key: string,
  initialValue: T,
): WritableAtom<T, W> => {
  const getInitialValue = () => {
    const item = localStorage.getItem(key)
    if (item !== null) {
      try {
        return JSON.parse(item)
      } catch (e) {
        console.error(
          'Failed to parse stored auth state. Using initialState',
          e,
        )
      }
    }
    return initialValue
  }
  const baseAtom = atom(getInitialValue())
  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    },
  )
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
