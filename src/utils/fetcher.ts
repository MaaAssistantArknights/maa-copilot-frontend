import camelcaseKeys from 'camelcase-keys'
import unfetch from 'unfetch'
import { envvarBoolean } from './envvar'

const fetch = window.fetch || unfetch

export class NetworkError extends Error {
  responseMessage: string

  constructor(response: Response, errorMessage: string) {
    const message = `Request failed for ${response.url}: ${errorMessage} (http status: ${response.status})`
    super(message)
    this.name = 'NetworkError'
    this.responseMessage = errorMessage
  }
}

const baseURL = envvarBoolean('USE_PRODUCTION_API')
  ? 'https://api.prts.plus'
  : 'http://localhost:5259'

export const request = <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> =>
  fetch(baseURL + input, init)
    .then(async (res) => {
      return {
        response: res,
        data: camelcaseKeys(await res.json(), { deep: true }),
      }
    })
    .then((res) => {
      if (
        (res.data.statusCode &&
          (res.data.statusCode < 200 || res.data.statusCode >= 300)) ||
        res.response.status < 200 ||
        res.response.status >= 300
      ) {
        console.error('Fetcher: got error response', res)
        return Promise.reject(
          new NetworkError(
            res.response,
            res.data?.message || res.data?.title || JSON.stringify(res.data),
          ),
        )
      }
      return res.data
    })

export type JsonRequestInit = RequestInit & {
  json?: any
}

export const jsonRequest = <T>(
  input: RequestInfo | URL,
  init?: JsonRequestInit,
): Promise<T> => {
  return request<T>(input, {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(init?.json),
  })
}
