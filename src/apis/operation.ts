import { QueriesCopilotRequest } from 'maa-copilot-client'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { toCopilotOperation } from 'models/converter'
import { OpRatingType, Operation } from 'models/operation'
import { OperationApi } from 'utils/maa-copilot-client'

export type OrderBy = 'views' | 'hot' | 'id'

export interface UseOperationsParams {
  orderBy?: OrderBy
  descending?: boolean
  keyword?: string
  levelKeyword?: string
  operator?: string
  operationIds?: number[]
  byMyself?: boolean

  disabled?: boolean
  suspense?: boolean
}

export function useOperations({
  orderBy,
  descending = true,
  keyword,
  levelKeyword,
  operator,
  operationIds,
  byMyself,
  disabled,
  suspense,
}: UseOperationsParams) {
  const {
    data: pages,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPage: { hasNext: boolean }) => {
      if (disabled) {
        return null
      }
      if (previousPage && !previousPage.hasNext) {
        return null // reached the end
      }

      return [
        'operations',
        {
          limit: 50,
          page: pageIndex + 1,
          document: keyword,
          levelKeyword,
          operator,
          orderBy,
          desc: descending,
          copilotIds: operationIds,
          uploaderId: byMyself ? 'me' : undefined,
        } satisfies QueriesCopilotRequest,
      ]
    },
    async ([, req]) => {
      const res = await new OperationApi({
        sendToken: req.uploaderId === 'me' ? 'always' : 'never',
        requireData: true,
      }).queriesCopilot(req)

      const parsedOperations: Operation[] = res.data.data.map((operation) => ({
        ...operation,
        parsedContent: toCopilotOperation(operation),
      }))

      return {
        ...res.data,
        data: parsedOperations,
      }
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
    },
  )

  const isReachingEnd = !!pages?.some((page) => !page.hasNext)

  const operations = pages?.map((page) => page.data).flat()

  return {
    operations,
    setSize,
    isValidating,
    isReachingEnd,
  }
}

interface UseOperationParams {
  id?: number
  suspense?: boolean
}

export function useOperation({ id, suspense }: UseOperationParams) {
  return useSWR(
    id ? ['operation', id] : null,
    () => getOperation({ id: id! }),
    { suspense },
  )
}

export async function getOperation(req: { id: number }): Promise<Operation> {
  const res = await new OperationApi({
    sendToken: 'optional', // 如果有 token 会用来获取用户是否点赞
    requireData: true,
  }).getCopilotById(req)

  return {
    ...res.data,
    parsedContent: toCopilotOperation(res.data),
  }
}

export async function createOperation(req: { content: string }) {
  await new OperationApi().uploadCopilot({ copilotCUDRequest: req })
}

export async function updateOperation(req: { id: number; content: string }) {
  await new OperationApi().updateCopilot({ copilotCUDRequest: req })
}

export async function deleteOperation(req: { id: number }) {
  await new OperationApi().deleteCopilot({ copilotCUDRequest: req })
}

export async function rateOperation(req: { id: number; rating: OpRatingType }) {
  const ratingTypeMapping: Record<OpRatingType, string> = {
    0: 'None',
    1: 'Like',
    2: 'Dislike',
  }

  await new OperationApi().ratesCopilotOperation({
    copilotRatingReq: {
      ...req,
      rating: ratingTypeMapping[req.rating],
    },
  })
}
