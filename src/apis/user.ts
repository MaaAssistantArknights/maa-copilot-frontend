import useSWR from 'swr'

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

      return res.data
    },
    { suspense },
  )
}

export function useUserSearch({ keyword }: { keyword?: string }) {
  return useSWR(
    keyword ? ['userSearch', keyword] : null,
    async ([, keyword]) => {
      const res = await new UserApi({
        sendToken: 'never',
        requireData: true,
      }).searchUsers({
        userName: keyword,
      })
      return res.data
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  )
}
