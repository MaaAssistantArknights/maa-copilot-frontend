import useSWR from 'swr'

import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'

import { request } from '../utils/fetcher'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = ({ suspense = true }: { suspense?: boolean } = {}) => {
  return useSWR<Response<Level[]>>('/arknights/level', {
    focusThrottleInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      const res = await request<Response<Level[]>>(input, init)
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

export const useOperators = () => {
  return useSWR<Response<Operator[]>>('/arknights/operator', {
    focusThrottleInterval: ONE_DAY,
  })
}
