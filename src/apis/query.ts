import { Operation, OperationListItem, Response } from 'models/operation'
import { useEffect } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { PaginatedResponse } from '../models/operation'

export type OrderBy = 'views' | 'rating' | 'id'

export const useOperations = (orderBy: OrderBy) => {
  const { data, ...rest } = useSWRInfinite<
    Response<PaginatedResponse<OperationListItem>>
  >((_pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData?.data.hasNext) {
      console.info('useOperations: No more pages')
      return null // reached the end
    }
    return `/copilot/query?order_by=${orderBy}&desc=true&page=${
      (previousPageData?.data?.page || 0) + 1
    }&limit=50` // SWR key
  })

  const operations = data
    ? ([] as OperationListItem[]).concat(...data.map((el) => el.data.data))
    : []

  useEffect(() => {
    rest.setSize(1)
  }, [orderBy])

  return { operations, ...rest }
}

export const useOperation = (id: string) => {
  return useSWR<Response<Operation>>(`/copilot/get/${id}`)
}
