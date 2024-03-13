export function formatError(e: unknown, fallback = '未知错误'): string {
  if (typeof e === 'string') {
    return e || fallback
  }

  if (e !== null && typeof e === 'object') {
    if ((e as Error).message) {
      return (e as Error).message
    }

    const str = String(e)
    return str === '[object Object]' ? fallback : str
  }

  return fallback
}

export class UnauthorizedError extends Error {
  message = this.message || '未登录，请先登录'
}

export class TokenExpiredError extends Error {
  message = this.message || '登录已过期，请重新登录'
}

export class InvalidTokenError extends Error {
  message = this.message || '登录失效，请重新登录'
}

export class NetworkError extends Error {
  message = this.message || '网络错误'
}

export class ApiError extends Error {
  message = this.message || '请求错误'
}
