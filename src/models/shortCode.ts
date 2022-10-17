export const shortCodeProtocol = 'maa://'

export function toShortCode(id: string) {
  return shortCodeProtocol + id
}

export function parseShortCode(code: string) {
  if (code.startsWith(shortCodeProtocol)) {
    return code.slice(shortCodeProtocol.length)
  }
  return null
}
