import { QueriesCopilotRequest } from 'maa-copilot-client'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { toCopilotOperation } from 'models/converter'
import { OpRatingType, Operation } from 'models/operation'
import { ShortCodeContent, parseShortCode } from 'models/shortCode'
import { OperationApi } from 'utils/maa-copilot-client'
import { useSWRRefresh } from 'utils/swr'

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
    error,
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

      // 用户输入神秘代码时，只传这个 id，其他参数都不传
      if (keyword) {
        let content: ShortCodeContent | null = null

        try {
          content = parseShortCode(keyword)
        } catch (e) {
          console.warn(e)
        }

        if (content) {
          let error: string | undefined

          if (content.type === 'operationSet') {
            error = '该神秘代码属于作业集，无法在此使用⊙﹏⊙∥'
          }

          return [
            'operations',
            {
              copilotIds: [content.id],
            } satisfies QueriesCopilotRequest,

            // 如果直接抛出 error 的话，useSWRInfinite 会把这个 error 吞掉，所以传到 fetcher 里再抛出
            // https://github.com/vercel/swr/issues/2102
            error,
          ]
        }
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
    async ([, req, error]) => {
      if (error) {
        throw new Error(error)
      }

      // 如果指定了 id 列表，但是列表为空，就直接返回空数据。不然要是直接传空列表，就相当于没有这个参数，
      // 会导致后端返回所有数据
      if (req.copilotIds?.length === 0) {
        return { data: [], hasNext: false }
      }

      const res = await new OperationApi({
        sendToken:
          'uploaderId' in req && req.uploaderId === 'me' ? 'always' : 'never',
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
    error,
    operations,
    setSize,
    isValidating,
    isReachingEnd,
  }
}

export function useRefreshOperations() {
  const refresh = useSWRRefresh()
  return () => refresh((key) => key.includes('operations'))
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

export function useRefreshOperation() {
  const refresh = useSWRRefresh()
  return (id: number) =>
    refresh((key) => key.includes('operation') && key.includes(String(id)))
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
