import { Alert, Button, Card, H4, NonIdealState, Tag } from '@blueprintjs/core'

import clsx from 'clsx'
import { useAtom } from 'jotai'
import { find } from 'lodash-es'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  requestDeleteComment,
  requestRateComment,
  useComments,
} from '../../../apis/comment'
import {
  CommentInfo,
  CommentRating,
  MainCommentInfo,
  SubCommentInfo,
  isMainComment,
  traverseComments,
} from '../../../models/comment'
import { Operation } from '../../../models/operation'
import { authAtom } from '../../../store/auth'
import { formatError } from '../../../utils/error'
import { formatDateTime } from '../../../utils/times'
import { wrapErrorMessage } from '../../../utils/wrapErrorMessage'
import { OutlinedIcon } from '../../OutlinedIcon'
import { withSuspensable } from '../../Suspensable'
import { CommentForm } from './CommentForm'

interface CommentAreaProps {
  operationId: Operation['id']
}

interface CommentAreaContext {
  operationId: Operation['id']
  replyTo?: CommentInfo
  setReplyTo: (replyTo?: CommentInfo) => void
  reload: () => void
}

export const CommentAreaContext = createContext<CommentAreaContext>({} as any)

export const CommentArea = withSuspensable(function ViewerComments({
  operationId,
}: CommentAreaProps) {
  const { comments, isValidating, isReachingEnd, setSize, mutate } =
    useComments({
      operationId,
      suspense: true,
    })

  const [replyTo, setReplyTo] = useState<CommentInfo>()

  // clear replyTo if it's not in comments
  useEffect(() => {
    if (
      replyTo &&
      !traverseComments(comments, (c) => c.commentId === replyTo.commentId)
    ) {
      setReplyTo(undefined)
    }
  }, [replyTo, comments])

  const contextValue = useMemo(
    () => ({
      operationId,
      replyTo,
      setReplyTo,
      reload: () => mutate(),
    }),
    [operationId, replyTo, setReplyTo],
  )

  return (
    <CommentAreaContext.Provider value={contextValue}>
      <div>
        <CommentForm className="mb-6" />
        {comments.map((comment) => (
          <MainComment
            key={comment.commentId}
            className="mt-3"
            comment={comment}
          >
            {comment.subCommentsInfos.map((sub) => (
              <SubComment
                key={sub.commentId}
                className="mt-6"
                comment={sub}
                fromComment={
                  sub.fromCommentId === comment.commentId
                    ? undefined
                    : find(comment.subCommentsInfos, {
                        commentId: sub.fromCommentId,
                      })
                }
              />
            ))}
          </MainComment>
        ))}
        {isReachingEnd && comments.length === 0 && (
          <NonIdealState
            icon="slash"
            title="没有找到任何作业"
            description="(つД｀)･ﾟ･"
          />
        )}

        {isReachingEnd && comments.length !== 0 && (
          <div className="mt-8 w-full tracking-wider text-center select-none text-slate-500">
            已经到底了哦 (ﾟ▽ﾟ)/
          </div>
        )}

        {!isReachingEnd && (
          <Button
            loading={isValidating}
            text="加载更多"
            icon="more"
            className="mt-2"
            large
            fill
            onClick={() => setSize((size) => size + 1)}
          />
        )}
      </div>
    </CommentAreaContext.Provider>
  )
})

const MainComment = ({
  className,
  comment,
  children,
}: {
  className?: string
  comment: MainCommentInfo
  children?: ReactNode
}) => {
  const { message, uploader, uploadTime } = comment

  return (
    <Card className={clsx(className)}>
      <div className="">
        <div className="mb-1 flex text-slate-500">
          <div className="font-bold mr-2">{uploader}</div>
          <div>{formatDateTime(uploadTime)}</div>
        </div>
        <div className="text-base">{message}</div>
        <CommentActions comment={comment} />
      </div>
      {children}
    </Card>
  )
}

const SubComment = ({
  className,
  comment,
  fromComment,
}: {
  className?: string
  comment: SubCommentInfo
  fromComment?: SubCommentInfo
}) => {
  const { message, uploader, uploadTime } = comment

  return (
    <div className={clsx(className, 'pl-8')}>
      <div className="mb-1 flex text-slate-500">
        <div className="font-bold mr-2">{uploader}</div>
        <div>{formatDateTime(uploadTime)}</div>
      </div>
      {comment.deleted ? (
        <div className="italic text-gray-500">（已删除）</div>
      ) : (
        <div>
          <div className="flex items-center text-base">
            {fromComment && (
              <>
                <Tag minimal className="mr-px">
                  回复 @{fromComment.uploader}
                </Tag>
                :&nbsp;
              </>
            )}
            <span>{message}</span>
          </div>
          <CommentActions comment={comment} />
        </div>
      )}
    </div>
  )
}

const CommentActions = ({
  className,
  comment,
}: {
  className?: string
  comment: CommentInfo
}) => {
  const [{ userId }] = useAtom(authAtom)
  const { replyTo, setReplyTo, reload } = useContext(CommentAreaContext)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    if (pending) {
      return
    }

    setPending(true)

    try {
      await wrapErrorMessage(
        (e) => '评分失败：' + formatError(e),
        requestDeleteComment(comment.commentId),
      )

      reload()
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <div
        className={clsx(
          className,
          'mt-2 -ml-1.5 flex items-center space-x-2 [&_*]:!text-slate-500',
        )}
      >
        <CommentRatingButtons comment={comment} />
        <Button
          minimal
          small
          className="!font-normal"
          active={replyTo === comment}
          onClick={() => setReplyTo(replyTo !== comment ? comment : undefined)}
        >
          回复
        </Button>
        {userId === comment.uploaderId && (
          <Button
            minimal
            small
            className="!font-normal"
            onClick={() => setDeleteDialogOpen(true)}
          >
            删除
          </Button>
        )}

        <Alert
          isOpen={deleteDialogOpen}
          cancelButtonText="取消"
          confirmButtonText="删除"
          icon="trash"
          intent="danger"
          canOutsideClickCancel
          loading={pending}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        >
          <H4>删除评论</H4>
          <p>
            确定要删除评论吗？
            {isMainComment(comment) && '所有子评论都会被删除。'}
          </p>
        </Alert>
      </div>
      {replyTo === comment && (
        <CommentForm
          embedded
          inputAutoFocus
          className="mt-4"
          placeholder={`回复 @${comment.uploader}:`}
        />
      )}
    </div>
  )
}

const CommentRatingButtons = ({ comment }: { comment: CommentInfo }) => {
  const { commentId, like } = comment
  const { reload } = useContext(CommentAreaContext)

  const [pending, setPending] = useState(false)

  const rate = async (rating: CommentRating) => {
    if (pending) {
      return
    }

    setPending(true)

    try {
      await wrapErrorMessage(
        (e) => '评分失败：' + formatError(e),
        requestRateComment(commentId, rating),
      )

      reload()
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        minimal
        small
        className="[&_.bp4-button-text]:-ml-0.5 "
        icon={<OutlinedIcon icon="thumbs-up" size={14} />}
        onClick={() => rate(CommentRating.Like)}
      >
        {like || ''}
      </Button>
      <Button
        minimal
        small
        icon={<OutlinedIcon icon="thumbs-down" size={14} />}
        onClick={() => rate(CommentRating.Dislike)}
      />
    </>
  )
}
