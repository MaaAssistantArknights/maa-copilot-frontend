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

export const useOperations = ({
  orderBy,
  query,
}: {
  orderBy: OrderBy
  query: string
}) => {
  const { data, ...rest } = useSWRInfinite<
    Response<PaginatedResponse<OperationListItem>>
  >((_pageIndex, previousPageData) => {
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
      searchParams.set('level_name', query)
    }

    return `/copilot/query?${searchParams.toString()}`
  })

  const isReachingEnd = data?.some((el) => !el.data.hasNext)

  const operations = data
    ? ([] as OperationListItem[]).concat(...data.map((el) => el.data.data))
    : []

  useEffect(() => {
    rest.setSize(1)
  }, [orderBy, query])

  return { operations, isReachingEnd, ...rest }
}

export const useOperation = (id: string) => {
  return useSWR<Response<Operation>>(`/copilot/get/${id}`)
}
