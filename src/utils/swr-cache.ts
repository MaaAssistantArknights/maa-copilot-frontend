const STORAGE_KEY = 'copilot-swr'

// 清理旧版本留下的缓存数据
// TODO: 等大部分用户都升级到新版本，就删除这个函数，大概在三个月之后？
export function clearOutdatedSwrCache() {
  localStorage.removeItem(STORAGE_KEY)
}
