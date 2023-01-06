import useSWR from 'swr'

import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'

import { withoutUnusedLevels } from '../models/level'
import { enableCache } from '../utils/swr-cache'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = ({ suspense = true }: { suspense?: boolean } = {}) => {
  const url = '/arknights/level'

  enableCache(
    url,
    // discard the cache if the level data has no stageId
    ({ data }) =>
      !!data?.data && Array.isArray(data.data) && 'stageId' in data.data[0],
  )

  return useSWR<Response<Level[]>>(url, {
    focusThrottleInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      // TODO: remove this when backend is ready
      const res = await requestBuiltInLevels(init)
      // const res = await request<Response<Level[]>>(input, init)

      res.data = withoutUnusedLevels(res.data)

      return res
    },
  })
}

const requestBuiltInLevels = async (
  init?: RequestInit,
): Promise<Response<Level[]>> => {
  const res = await fetch('/levels.json', init)
  const data = await res.json()
  return {
    data,
    statusCode: 200,
    message: 'OK',
    traceId: '',
  }
}

export const useOperators = () => {
  return useSWR<Response<Operator[]>>('/arknights/operator', {
    focusThrottleInterval: ONE_DAY,
  })
}
