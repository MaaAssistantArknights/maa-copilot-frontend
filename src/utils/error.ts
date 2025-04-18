import i18n from '../i18n'

export function formatError(
  e: unknown,
  fallback = i18n.t('utils.error.unknown_error'),
): string {
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
  message = this.message || i18n.t('utils.error.unauthorized')
}

export class TokenExpiredError extends Error {
  message = this.message || i18n.t('utils.error.token_expired')
}

export class InvalidTokenError extends Error {
  message = this.message || i18n.t('utils.error.invalid_token')
}

export class NotFoundError extends Error {
  message = this.message || i18n.t('utils.error.not_found')
}

export class NetworkError extends Error {
  message = this.message || i18n.t('utils.error.network_error')
}

export class ApiError extends Error {
  message = this.message || i18n.t('utils.error.api_error')
}
