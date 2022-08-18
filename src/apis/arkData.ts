import { Response } from 'models/network'
import { Level } from 'models/operation'
import useSWR from 'swr'

export const useStages = () => {
  return useSWR<Response<Level[]>>('/arknights/level', {
    focusThrottleInterval: 1000 * 60 * 60 * 24,
  })
}
