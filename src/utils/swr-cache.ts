import { useFirstMountState } from 'react-use'
import { State, useSWRConfig } from 'swr'

type SwrCache = [string, State][]

const STORAGE_KEY = 'copilot-swr'

const cachedKeys = new Set<string>()

/**
 * @param validate - validates the cached state, if it returns false, the state will be discarded.
 */
export function enableCache(key: string, validate?: (state: State) => boolean) {
  cachedKeys.add(key)

  const isFirstMount = useFirstMountState()
  const { cache, mutate } = useSWRConfig()

  // only validate cache on first mount, meaning that the validator
  // will only run on cached data, not on fresh data
  if (isFirstMount && validate) {
    const state = cache.get(key)

    if (state && !validate(state)) {
      mutate(key, undefined, { revalidate: false })
    }
  }
}

// https://swr.vercel.app/docs/advanced/cache#localstorage-based-persistent-cache
export function localStorageProvider() {
  const map = new Map<string, any>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  )

  window.addEventListener('beforeunload', () => {
    const cache = Object.fromEntries(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SwrCache,
    )

    // overwrite cache with map entries
    Array.from(map.entries())
      .filter(
        ([key, state]) => cachedKeys.has(key) && state.data && !state.error,
      )
      .forEach(([key, state]) => (cache[key] = state))

    // remove entries that are no longer needed
    Object.keys(cache).forEach((key) => {
      if (!cachedKeys.has(key)) {
        delete cache[key]
      }
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.entries(cache)))
  })

  return map
}
