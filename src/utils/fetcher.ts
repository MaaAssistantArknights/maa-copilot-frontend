import camelcaseKeys from 'camelcase-keys'
import { merge } from 'lodash-es'
import unfetch from 'unfetch'

import { Response } from 'models/network'

import { envUseProductionApi } from './envvar'

const fetch = window.fetch || unfetch

export class NetworkError extends Error {}

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
    .catch((err) => {
      console.error('Fetcher: got error', err)
      return Promise.reject(new Error('网络错误，请检查网络连接并稍后重试'))
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
          new Error(
            res.data?.message ||
              JSON.stringify(res.data) ||
              `Unknown error (${
                res.data.statusCode || res.response.status || 'unknown'
              })`,
          ),
        )
      }
      return res.data
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
