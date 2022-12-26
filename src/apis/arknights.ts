import useSWR from 'swr'

import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'

import { enableCache } from '../utils/swr-cache'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = ({ suspense = true }: { suspense?: boolean } = {}) => {
  const url = '/arknights/level'

  enableCache(url)

  return useSWR<Response<Level[]>>(url, {
    focusThrottleInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      // TODO: remove this when backend is ready
      const res = await requestBuiltInLevels(init)
      // const res = await request<Response<Level[]>>(input, init)

      const uniqueLevels: Record<string, Level> = {}

      res.data.forEach((level) => {
        if (uniqueLevels[level.levelId]) {
          console.warn('Duplicate level', level)
        } else {
          uniqueLevels[level.levelId] = level
        }
      })

      res.data = Object.values(uniqueLevels)

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
