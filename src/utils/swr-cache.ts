import { State } from 'swr'

type SwrCache = [string, State][]

const STORAGE_KEY = 'copilot-swr'

const cachedKeys = new Set<string>()

export function enableCache(key: string) {
  cachedKeys.add(key)
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
