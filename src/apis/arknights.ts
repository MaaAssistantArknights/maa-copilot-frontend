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

export const useLevels = ({ suspense }: { suspense?: boolean } = {}) => {
  const url = '/arknights/level'
  type LevelResponse = Response<Level[]>

  return useSWR<LevelResponse>(url, {
    focusThrottleInterval: ONE_DAY,
    dedupingInterval: ONE_DAY,
    suspense,
    fetcher: async (input: string, init?: RequestInit) => {
      const res = await request<LevelResponse>(input, init)

      const stageIds = new Set<string>()

      res.data = res.data.filter((level) => {
        if (
          // 肉鸽
          level.levelId.includes('roguelike') ||
          // 保全派驻
          level.levelId.includes('legion')
        ) {
          return false
        }

        if (stageIds.has(level.stageId)) {
          console.warn('Duplicate level removed:', level.stageId, level.name)
          return false
        }

        stageIds.add(level.stageId)

        return true
      })

      return res
    },
  })
}

export const useOperators = () => {
  return useSWR<Response<Operator[]>>('/arknights/operator', {
    focusThrottleInterval: ONE_DAY,
  })
}
