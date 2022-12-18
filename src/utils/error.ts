export function formatError(
  e: unknown,
  fallback = '未知错误',
): string | undefined {
  if (e === undefined) {
    return undefined
  }

  if (typeof e === 'string') {
    return e || fallback
  }

  if (typeof e === 'object') {
    if ((e as Error).message) {
      return (e as Error).message
    }

    const str = String(e)
    return str === '[object Object]' ? fallback : str
  }

  return fallback
}
