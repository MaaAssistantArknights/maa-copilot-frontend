import type { Operator, Version } from 'models/arknights'
import type { Response } from 'models/network'
import type { Level } from 'models/operation'
import useSWR from 'swr'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWR<Response<Version>>('/arknights/version', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useLevels = () => {
  return useSWR<Response<Level[]>>('/arknights/level', {
    focusThrottleInterval: ONE_DAY,
  })
}

export const useOperators = () => {
  return useSWR<Response<Operator[]>>('/arknights/operator', {
    focusThrottleInterval: ONE_DAY,
  })
}
