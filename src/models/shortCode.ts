import { Operation } from './operation'

export const shortCodeScheme = 'maa://'

export function toShortCode(id: Operation['id']) {
  return shortCodeScheme + id
}

export function parseShortCode(code: string): number | null {
  if (code.startsWith(shortCodeScheme)) {
    return +code.slice(shortCodeScheme.length) || null
  }
  return null
}
