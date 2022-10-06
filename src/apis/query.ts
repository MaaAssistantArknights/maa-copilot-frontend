import { useEffect } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { Response } from 'models/network'
import type {
  Operation,
  OperationListItem,
  PaginatedResponse,
} from 'models/operation'

import { parseShortCode, shortCodeProtocol } from '../models/shortCode'

export type OrderBy = 'views' | 'hot' | 'id'

export interface UseOperationsParams {
  orderBy: OrderBy
  document?: string
  levelKeyword?: string
  operator?: string
  byMyself?: boolean
}

export const useOperations = ({
  orderBy,
  document,
  levelKeyword,
  operator,
  byMyself,
}: UseOperationsParams) => {
  const isIdQuery = document?.startsWith(shortCodeProtocol)

  const {
    data: listData,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite<Response<PaginatedResponse<OperationListItem>>>(
    (_pageIndex, previousPageData) => {
      if (isIdQuery) {
        return null
      }
      if (previousPageData && !previousPageData?.data.hasNext) {
        console.info('useOperations: No more pages')
        return null // reached the end
      }
      const searchParams = new URLSearchParams('?desc=true&limit=50')
      searchParams.set(
        'page',
        ((previousPageData?.data?.page || 0) + 1).toString(),
      )
      searchParams.set('order_by', orderBy)
      if (document) {
        searchParams.set('document', document)
      }
      if (levelKeyword) {
        searchParams.set('level_keyword', levelKeyword)
      }
      if (operator) {
        searchParams.set('operator', operator)
      }
      if (byMyself) {
        searchParams.set('uploader_id', 'me')
      }

      return `/copilot/query?${searchParams.toString()}`
    },
  )

  const { data: singleData } = useSWR<Response<Operation>>(
    isIdQuery && `/copilot/get/${parseShortCode(document!) || ''}`,
  )

  const isReachingEnd = isIdQuery || listData?.some((el) => !el.data.hasNext)

  const operations: OperationListItem[] =
    (isIdQuery
      ? singleData && [singleData.data]
      : listData?.map((el) => el.data.data).flat()) || []

  useEffect(() => {
    setSize(1)
  }, [orderBy, document, levelKeyword, operator])

  return { operations, size, setSize, isValidating, isReachingEnd }
}

export const useOperation = (id: string | undefined) => {
  return useSWR<Response<Operation>>(id ? `/copilot/get/${id}` : null)
}
