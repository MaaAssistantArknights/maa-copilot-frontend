/*
 * operation:    maa://123456
 * operationSet: maa://c123456
 */

const shortCodeScheme = 'maa://'

export interface ShortCodeContent {
  id: number
  type: 'operation' | 'operationSet'
}

export function toShortCode({ id, type }: ShortCodeContent) {
  if (type === 'operation') {
    return shortCodeScheme + id
  } else if (type === 'operationSet') {
    return shortCodeScheme + 'c' + id
  }
  throw new Error('无效的神秘代码类型')
}

export function parseShortCode(code: string): ShortCodeContent | null {
  if (code.startsWith(shortCodeScheme)) {
    const idStr = code.slice(shortCodeScheme.length)
    let content: ShortCodeContent

    if (idStr.startsWith('c')) {
      content = {
        id: +idStr.slice(1),
        type: 'operationSet',
      }
    } else {
      content = {
        id: +idStr,
        type: 'operation',
      }
    }

    if (!isNaN(content.id)) {
      return content
    }
  }
  return null
}
