import camelcaseKeys from 'camelcase-keys'
import { merge } from 'lodash-es'
import { Response } from 'models/network'
import unfetch from 'unfetch'
import { envUseProductionApi } from './envvar'

const fetch = window.fetch || unfetch

type FetchResponse = globalThis.Response

export class NetworkError extends Error {
  responseMessage: string

  constructor(response?: FetchResponse, errorMessage?: string) {
    const message = `Request failed for ${response?.url}: ${errorMessage} (http status: ${response?.status})`
    super(message)
    this.name = 'NetworkError'
    this.responseMessage = errorMessage || 'Unknown error'
  }
}

const baseURL = envUseProductionApi
  ? 'https://api.prts.plus'
  : 'http://localhost:5259'

export const FETCHER_CONFIG: {
  apiToken?: string
} = {
  apiToken: undefined,
}

export const request = <T extends Response<unknown>>(
  input: string,
  init?: RequestInit,
): Promise<T> =>
  fetch(
    baseURL + input,
    merge(
      init,
      FETCHER_CONFIG.apiToken && {
        headers: {
          Authorization: `Bearer ${FETCHER_CONFIG.apiToken}`,
        },
      },
    ),
  )
    .then(async (res) => {
      return {
        response: res,
        data: camelcaseKeys(await res.json(), { deep: true }) as T,
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
            res.data?.message || JSON.stringify(res.data) || 'Unknown error',
          ),
        )
      }
      return res.data
    })
    .catch((err) => {
      console.error('Fetcher: got error', err)
      return Promise.reject(
        new NetworkError(err.response, '网络错误，请检查网络连接并稍后重试'),
      )
    })

export type JsonRequestInit = RequestInit & {
  json?: any
}

export const jsonRequest = <T extends Response<unknown>>(
  input: string,
  init?: JsonRequestInit,
): Promise<T> =>
  request<T>(
    input,
    merge(init, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(init?.json),
    }),
  )
