import { uniqBy } from 'lodash-es'
import {
  BanCommentsStatusEnum,
  CopilotInfoStatusEnum,
  QueriesCopilotRequest,
} from 'maa-copilot-client'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { toCopilotOperation } from 'models/converter'
import { OpRatingType, Operation } from 'models/operation'
import { ShortCodeContent, parseShortCode } from 'models/shortCode'
import { OperationApi } from 'utils/maa-copilot-client'
import { useSWRRefresh } from 'utils/swr'

export type OrderBy = 'views' | 'hot' | 'id'

export interface UseOperationsParams {
  limit?: number
  orderBy?: OrderBy
  descending?: boolean
  keyword?: string
  levelKeyword?: string
  operator?: string
  operationIds?: number[]
  uploaderId?: string

  disabled?: boolean
  suspense?: boolean
  revalidateFirstPage?: boolean
}

export function useOperations({
  limit = 50,
  orderBy,
  descending = true,
  keyword,
  levelKeyword,
  operator,
  operationIds,
  uploaderId,
  disabled,
  suspense,
  revalidateFirstPage,
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
          return [
            'operations',
            {
              copilotIds: [content.id],
            } satisfies QueriesCopilotRequest,
          ]
        }
      }

      return [
        'operations',
        {
          limit,
          page: pageIndex + 1,
          document: keyword,
          levelKeyword,
          operator,
          orderBy,
          desc: descending,
          copilotIds: operationIds,
          uploaderId,
        } satisfies QueriesCopilotRequest,
      ]
    },
    async ([, req]) => {
      // 如果指定了 id 列表，但是列表为空，就直接返回空数据。不然要是直接传空列表，就相当于没有这个参数，
      // 会导致后端返回所有数据
      if (req.copilotIds?.length === 0) {
        return { data: [], hasNext: false, total: 0 }
      }

      const res = await new OperationApi({
        sendToken: 'optional',
        requireData: true,
      }).queriesCopilot(req)

      let parsedOperations: Operation[] = res.data.data.map((operation) => ({
        ...operation,
        parsedContent: toCopilotOperation(operation),
      }))

      // 如果 revalidateFirstPage=false，从第二页开始可能会有重复数据，需要去重
      parsedOperations = uniqBy(parsedOperations, (o) => o.id)

      return {
        ...res.data,
        data: parsedOperations,
      }
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
      revalidateFirstPage,
    },
  )

  const isReachingEnd = !!pages?.some((page) => !page.hasNext)
  const total = pages?.[0]?.total ?? 0

  const _operations = pages?.map((page) => page.data).flat() ?? []

  // 按 operationIds 的顺序排序
  const operations = operationIds?.length
    ? operationIds
        ?.map((id) => _operations?.find((v) => v.id === id))
        .filter((v) => !!v)
    : _operations

  return {
    error,
    operations,
    total,
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

export async function createOperation(req: {
  content: string
  status: CopilotInfoStatusEnum
}) {
  await new OperationApi().uploadCopilot({ copilotCUDRequest: req })
}

export async function updateOperation(req: {
  id: number
  content: string
  status: CopilotInfoStatusEnum
}) {
  await new OperationApi().updateCopilot({ copilotCUDRequest: req })
}

export async function deleteOperation(req: { id: number }) {
  await new OperationApi().deleteCopilot({
    copilotCUDRequest: {
      content: '',
      status: CopilotInfoStatusEnum.Public,
      ...req,
    },
  })
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

export async function banComments(req: {
  operationId: number
  status: BanCommentsStatusEnum
}) {
  await new OperationApi().banComments({
    copilotId: req.operationId,
    ...req,
  })
}
