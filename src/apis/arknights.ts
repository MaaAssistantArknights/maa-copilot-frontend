import useSWR from 'swr'

import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'

import { withoutUnusedLevels } from '../models/level'
import { request } from '../utils/fetcher'
import { useSWRCache } from '../utils/swr-cache'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = ({ suspense }: { suspense?: boolean } = {}) => {
  const url = '/arknights/level'
  type LevelResponse = Response<Level[]>

  useSWRCache(
    url,
    // discard the cache if the level data has no stageId
    ({ data }) => {
      const firstLevel = (data as LevelResponse)?.data?.[0]
      return !!firstLevel && 'stageId' in firstLevel
    },
  )

  const response = useSWR<LevelResponse>(url, {
    focusThrottleInterval: ONE_DAY,
    dedupingInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      let res: LevelResponse

      try {
        res = await request<LevelResponse>(input, init)
      } catch (e) {
        // fallback to built-in levels while retaining the error
        res = await requestBuiltInLevels(init)
        ;(res as any).__serverError = e
      }

      res.data = withoutUnusedLevels(res.data)

      return res
    },
  })

  if ((response.data as any)?.__serverError) {
    return {
      ...response,
      error: (response.data as any).__serverError,
    }
  }

  return response
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
