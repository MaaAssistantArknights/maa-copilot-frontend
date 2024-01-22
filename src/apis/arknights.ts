import useSWR from 'swr'

import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'

import { withoutUnusedLevels } from '../models/level'
import { request } from '../utils/fetcher'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = ({ suspense }: { suspense?: boolean } = {}) => {
  const url = '/arknights/level'
  type LevelResponse = Response<Level[]>

  return useSWR<LevelResponse>(url, {
    focusThrottleInterval: ONE_DAY,
    dedupingInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      const res = await request<LevelResponse>(input, init)

      res.data = withoutUnusedLevels(res.data)

      return res
    },
  })
}

export const useOperators = () => {
  return useSWR<Response<Operator[]>>('/arknights/operator', {
    focusThrottleInterval: ONE_DAY,
  })
}
