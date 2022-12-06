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
    const cache = Array.from(map.entries()).filter(([key]) =>
      cachedKeys.has(key),
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  })

  return map
}
