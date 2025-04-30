import {
  CommentsAreaInfo,
  QueriesCommentsAreaRequest,
} from 'maa-copilot-client'
import { useTranslation } from 'react-i18next'
import useSWRInfinite from 'swr/infinite'

import { CommentApi } from 'utils/maa-copilot-client'

import { CommentRating } from '../models/comment'
import { Operation } from '../models/operation'

export interface UseCommentsParams {
  operationId: Operation['id']
  descending?: boolean
  orderBy?: 'likeCount' | 'uploadTime'

  suspense?: boolean
}

export function useComments({
  operationId,
  descending = true,
  orderBy,
  suspense,
}: UseCommentsParams) {
  const { t } = useTranslation()
  const {
    data: pages,
    setSize,
    mutate,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPage: CommentsAreaInfo) => {
      if (previousPage && !previousPage?.hasNext) {
        return null // reached the end
      }

      if (!isFinite(+operationId)) {
        throw new Error(t('apis.comment.invalid_operation_id'))
      }

      return [
        'comments',
        {
          copilotId: operationId,
          limit: 50,
          page: pageIndex + 1,
          desc: descending,
          orderBy,
        } satisfies QueriesCommentsAreaRequest,
      ]
    },
    async ([, req]) => {
      const res = await new CommentApi({
        sendToken: 'never',
        requireData: true,
      }).queriesCommentsArea(req)
      return res.data!
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
    },
  )

  const isReachingEnd = pages?.some((page) => !page.hasNext)

  const comments = pages?.map((el) => el.data).flat()

  return {
    comments,
    setSize,
    mutate,
    isValidating,
    isReachingEnd,
  }
}

export async function sendComment(req: {
  message: string
  operationId: number
  fromCommentId?: string
}) {
  await new CommentApi().sendComments({
    commentsAddDTO: {
      message: req.message,
      copilotId: req.operationId,
      fromCommentId: req.fromCommentId,
      notification: false,
      commentStatus: 'ENABLED',
    },
  })
}

export async function deleteComment(req: { commentId: string }) {
  await new CommentApi().deleteComments({ commentsDeleteDTO: req })
}

export async function rateComment(req: {
  commentId: string
  rating: CommentRating
}) {
  await new CommentApi().ratesComments({ commentsRatingDTO: req })
}

export async function topComment(req: { commentId: string; topping: boolean }) {
  await new CommentApi().toppingComments({ commentsToppingDTO: req })
}
