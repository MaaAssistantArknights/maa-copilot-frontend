import { useEffect } from 'react'
import { Middleware, SWRHook, State, useSWRConfig } from 'swr'

type SwrCache = [string, State][]

const STORAGE_KEY = 'copilot-swr'

const cachedKeys = new Set<string>()

// keys that have been validated (even if no validator is provided for it)
const validatedKeys = new Set<string>()

/**
 * @param validate - validates the cached state, if it returns false, the state will be discarded.
 * This function will only run once for each key (because we want it to validate cached data, not fresh data).
 */
export function enableCache(
  key: string,
  validate?: (state: State<unknown>) => boolean,
) {
  cachedKeys.add(key)

  const { cache, mutate } = useSWRConfig()

  useEffect(() => {
    if (!validatedKeys.has(key)) {
      validatedKeys.add(key)

      if (validate) {
        const state = cache.get(key)

        if (state) {
          let isValid: boolean

          try {
            isValid = validate(state)
          } catch (e) {
            isValid = false
            console.warn(e)
          }

          if (!isValid) {
            console.log('[SWR cache]: invalid cache, discarding:', key)

            mutate(key, undefined, { revalidate: false })
          }
        }
      }
    }
  }, [])
}

/**
 * The only thing this middleware does is to borrow the <SWRConfig>'s lifecycle
 * and clear the key maps when it unmounts (happens during hot reload).
 * It should be used in the topmost <SWRConfig>.
 */
export const swrCacheMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    useEffect(
      () => () => {
        cachedKeys.clear()
        validatedKeys.clear()
      },
      [],
    )

    return useSWRNext(key, fetcher, config)
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
