import useSWRImmutable from 'swr/immutable'

import type { Response } from 'models/network'
import type { Version, Operator } from 'models/arknights'
import type { Level } from 'src/models/operation'
import { jsonRequest } from 'utils/fetcher'

const ONE_DAY = 1000 * 60 * 60 * 24

export const useVersion = () => {
  return useSWRImmutable<Response<Version>>('/arknights/version', jsonRequest, {
    refreshInterval: ONE_DAY,
  })
}

export const useLevels = () => {
  return useSWRImmutable<Response<Level[]>>('/arknights/level', jsonRequest, {
    // since there is no Cache-Control header present
    // this is a force refresh to reduce api calls
    refreshInterval: ONE_DAY,
  })
}

export const useOperators = () => {
  return useSWRImmutable<Response<Operator[]>>('/arknights/operator')
}
