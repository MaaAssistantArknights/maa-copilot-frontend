export const shortCodeScheme = 'maa://'

export function toShortCode(id: string) {
  return shortCodeScheme + id
}

export function parseShortCode(code: string) {
  if (code.startsWith(shortCodeScheme)) {
    return code.slice(shortCodeScheme.length)
  }
  return null
}
