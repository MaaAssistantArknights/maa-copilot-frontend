import { Response } from 'models/network'
import type {
  Operation,
  OperationListItem,
  PaginatedResponse,
} from 'models/operation'
import { useEffect } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

export type OrderBy = 'views' | 'hot' | 'id'

const maaProtocol = 'maa://'

export const useOperations = ({
  orderBy,
  query,
}: {
  orderBy: OrderBy
  query: string
}) => {
  const isIdQuery = query.startsWith(maaProtocol)

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
      if (query) {
        searchParams.set('level_keyword', query)
      }

      return `/copilot/query?${searchParams.toString()}`
    },
  )

  const { data: singleData } = useSWR<Response<Operation>>(
    isIdQuery && `/copilot/get/${query.slice(maaProtocol.length)}`,
  )

  const isReachingEnd = isIdQuery || listData?.some((el) => !el.data.hasNext)

  const operations: OperationListItem[] =
    (isIdQuery
      ? singleData && [singleData.data]
      : listData?.map((el) => el.data.data).flat()) || []

  useEffect(() => {
    setSize(1)
  }, [orderBy, query])

  return { operations, size, setSize, isValidating, isReachingEnd }
}

export const useOperation = (id: string) => {
  return useSWR<Response<Operation>>(`/copilot/get/${id}`)
}
