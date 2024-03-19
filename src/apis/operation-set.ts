import {
  CopilotSetPageRes,
  CopilotSetQuery,
  CopilotSetStatus,
} from 'maa-copilot-client'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { OperationSetApi } from 'utils/maa-copilot-client'

export type OrderBy = 'views' | 'hot' | 'id'

export interface UseOperationSetsParams {
  keyword?: string

  disabled?: boolean
  suspense?: boolean
}

export function useOperationSets({
  keyword,
  disabled,
  suspense,
}: UseOperationSetsParams) {
  const {
    data: pages,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPage: CopilotSetPageRes) => {
      if (disabled) {
        return null
      }
      if (previousPage && !previousPage.hasNext) {
        return null // reached the end
      }

      return [
        'operationSets',
        {
          limit: 50,
          page: pageIndex + 1,
          keyword,
        } satisfies CopilotSetQuery,
      ]
    },
    async ([, req]) => {
      const res = await new OperationSetApi({
        sendToken: 'never',
        requireData: true,
      }).querySets({ copilotSetQuery: req })
      return res.data
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
    },
  )

  const isReachingEnd = !!pages?.some((page) => !page.hasNext)
  const operationSets = pages?.map((page) => page.data).flat()

  return {
    operationSets,
    setSize,
    isValidating,
    isReachingEnd,
  }
}

interface UseOperationSetParams {
  id?: number
  suspense?: boolean
}

export function useOperationSet({ id, suspense }: UseOperationSetParams) {
  return useSWR(
    id ? ['operationSet', id] : null,
    () => getOperationSet({ id: id! }),
    { suspense },
  )
}

export async function getOperationSet(req: { id: number }) {
  const res = await new OperationSetApi({
    sendToken: 'optional', // 如果有 token 会用来获取用户是否点赞
    requireData: true,
  }).getSet(req)
  return res.data
}

export async function createOperationSet(req: {
  name: string
  description: string
  operationIds: number[]
  status: CopilotSetStatus
}) {
  await new OperationSetApi().createSet({
    copilotSetCreateReq: {
      name: req.name,
      description: req.description,
      copilotIds: req.operationIds,
      status: req.status,
    },
  })
}

export async function updateOperationSet(req: {
  id: number
  name: string
  description: string
  status: CopilotSetStatus
}) {
  await new OperationSetApi().updateCopilotSet({ copilotSetUpdateReq: req })
}

export async function deleteOperationSet(req: { id: number }) {
  await new OperationSetApi().deleteCopilotSet({ commonIdReqLong: req })
}
