import { isNil } from 'lodash-es'
import { useEffect } from 'react'
import useSWRInfinite from 'swr/infinite'

import { Response } from 'models/network'
import { jsonRequest } from 'utils/fetcher'

import { CommentRating, MainCommentInfo } from '../models/comment'
import { Operation, PaginatedResponse } from '../models/operation'

export interface CommentsQueryParams {
  copilotId: number
  page?: number
  limit?: number
  desc?: boolean
  orderBy?: string
}

export interface UseCommentsParams
  extends Omit<CommentsQueryParams, 'page' | 'copilotId'> {
  suspense?: boolean
  operationId: Operation['id']
}

export const useComments = ({
  operationId,
  limit,
  desc,
  orderBy = 'uploadTime',
  suspense,
}: UseCommentsParams) => {
  const {
    data: listData,
    size,
    setSize,
    mutate,
    isValidating,
  } = useSWRInfinite<Response<PaginatedResponse<MainCommentInfo>>>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData?.data.hasNext) {
        return null // reached the end
      }

      if (!isFinite(+operationId)) {
        throw new Error('operationId is not a valid number')
      }

      const params: CommentsQueryParams = {
        page: pageIndex + 1,
        copilotId: +operationId,
        limit,
        desc,
        orderBy,
      }

      const searchParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (!isNil(value)) {
          searchParams.append(key, value.toString())
        }
      })

      return `/comments/query?${searchParams.toString()}`
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
    },
  )

  const isReachingEnd = listData?.some((el) => !el.data.hasNext)

  const comments: MainCommentInfo[] =
    listData?.map((el) => el.data.data).flat() || []

  useEffect(() => {
    setSize(1)
  }, [orderBy, limit, desc, operationId])

  return { comments, size, setSize, mutate, isValidating, isReachingEnd }
}

export const requestAddComment = (
  message: string,
  operationId: Operation['id'],
  fromCommentId?: string,
) => {
  return jsonRequest<Response<string>>('/comments/add', {
    method: 'POST',
    json: {
      copilot_id: operationId,
      message,
      from_comment_id: fromCommentId,
    },
  })
}

export const requestDeleteComment = (commentId: string) => {
  return jsonRequest<Response<string>>('/comments/delete', {
    method: 'POST',
    json: {
      comment_id: commentId,
    },
  })
}

export const requestRateComment = (
  commentId: string,
  rating: CommentRating,
) => {
  return jsonRequest<Response<string>>('/comments/rating', {
    method: 'POST',
    json: {
      comment_id: commentId,
      rating,
    },
  })
}
