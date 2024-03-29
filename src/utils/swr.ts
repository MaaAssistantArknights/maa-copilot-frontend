import { useSWRConfig } from 'swr'

const STORAGE_KEY = 'copilot-swr'

// 清理旧版本留下的缓存数据
// TODO: 等大部分用户都升级到新版本，就删除这个函数，大概在三个月之后？
export function clearOutdatedSwrCache() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Compared with bare mutate(), this hook has an additional support for
 * refreshing the data of useSWRInfinite(), but may cause unwanted
 * revalidation of other keys if not used carefully.
 * @see https://github.com/vercel/swr/issues/1670#issuecomment-1625977770
 */
export function useSWRRefresh() {
  const { mutate, cache } = useSWRConfig()

  return (keyMatcher: (key: string) => boolean) => {
    for (const key of cache.keys()) {
      if (keyMatcher(key)) {
        mutate(key)
      }
    }
  }
}
