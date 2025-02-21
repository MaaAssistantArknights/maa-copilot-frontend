import useSWR from 'swr'

import { NotFoundError } from '../utils/error'
import { UserApi } from '../utils/maa-copilot-client'

export function useUserInfo({
  userId,
  suspense,
}: {
  userId?: string
  suspense?: boolean
}) {
  return useSWR(
    userId ? ['user', userId] : null,
    async ([, userId]) => {
      const res = await new UserApi({
        sendToken: 'never',
        requireData: true,
      }).getUserInfo({
        userId,
      })

      // FIXME: 严谨一点！！！
      if (res.data.userName === '未知用户:(') {
        throw new NotFoundError()
      }

      return res.data
    },
    { suspense },
  )
}
