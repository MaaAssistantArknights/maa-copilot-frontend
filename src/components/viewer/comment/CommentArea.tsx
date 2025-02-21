import { Alert, Button, Card, H4, NonIdealState, Tag } from '@blueprintjs/core'

import { useOperation } from 'apis/operation'
import clsx from 'clsx'
import { useAtom, useAtomValue } from 'jotai'
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
  deleteComment,
  rateComment,
  topComment,
  useComments,
} from '../../../apis/comment'
import {
  AUTHOR_MAX_COMMENT_LENGTH,
  CommentInfo,
  CommentRating,
  MAX_COMMENT_LENGTH,
  MainCommentInfo,
  SubCommentInfo,
  isMainComment,
  traverseComments,
} from '../../../models/comment'
import { Operation } from '../../../models/operation'
import { authAtom } from '../../../store/auth'
import { formatError } from '../../../utils/error'
import { formatDateTime, formatRelativeTime } from '../../../utils/times'
import { wrapErrorMessage } from '../../../utils/wrapErrorMessage'
import { Markdown } from '../../Markdown'
import { OutlinedIcon } from '../../OutlinedIcon'
import { withSuspensable } from '../../Suspensable'
import { UserName } from '../../UserName'
import { CommentForm } from './CommentForm'

interface CommentAreaProps {
  operationId: Operation['id']
}

interface CommentAreaContext {
  operationId: Operation['id']
  operationOwned: boolean
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

  const auth = useAtomValue(authAtom)
  const operation = useOperation({ id: operationId }).data

  const operationOwned = !!(
    operation &&
    auth.userId &&
    operation.uploaderId === auth.userId
  )

  const maxLength = operationOwned
    ? AUTHOR_MAX_COMMENT_LENGTH
    : MAX_COMMENT_LENGTH

  const [replyTo, setReplyTo] = useState<CommentInfo>()

  // clear replyTo if it's not in comments
  useEffect(() => {
    if (
      replyTo &&
      (!comments || !traverseComments(comments, (c) => c === replyTo))
    ) {
      setReplyTo(undefined)
    }
  }, [replyTo, comments])

  const contextValue = useMemo(
    () => ({
      operationId,
      operationOwned,
      replyTo,
      setReplyTo,
      reload: () => mutate(),
    }),
    [operationId, operationOwned, replyTo, setReplyTo, mutate],
  )

  return (
    <CommentAreaContext.Provider value={contextValue}>
      <div>
        <CommentForm primary className="mb-6" maxLength={maxLength} />
        {comments?.map((comment) => (
          <MainComment
            key={comment.commentId}
            className="mt-3"
            comment={comment}
          >
            {comment.subCommentsInfos.map((sub) => (
              <SubComment
                key={sub.commentId}
                className="mt-2"
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
        {isReachingEnd && !comments?.length && (
          <NonIdealState
            icon="comment"
            title="还没有评论，发一条评论鼓励作者吧！"
            description="(｡･ω･｡)ﾉ♡"
          />
        )}

        {isReachingEnd && !!comments?.length && (
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
  return (
    <Card
      className={clsx(
        className,
        comment.topping && 'shadow-[0_0_0_1px_#2d72d2]',
      )}
    >
      <div>
        <CommentHeader comment={comment} />
        <CommentContent comment={comment} />
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
  return (
    <div className={clsx(className, 'pl-8')}>
      <CommentHeader comment={comment} />
      {comment.deleted ? (
        <div className="italic text-gray-500">（已删除）</div>
      ) : (
        <div>
          <div className="flex items-center text-base">
            {fromComment && (
              <>
                <Tag minimal className="mr-px">
                  回复
                  <UserName userId={fromComment.uploaderId}>
                    @{fromComment.uploader}
                  </UserName>
                </Tag>
                :&nbsp;
              </>
            )}
            <CommentContent comment={comment} />
          </div>
          <CommentActions comment={comment} />
        </div>
      )}
    </div>
  )
}

const CommentHeader = ({
  className,
  comment,
}: {
  className?: string
  comment: CommentInfo
}) => {
  const { uploader, uploaderId, uploadTime } = comment
  const topping = isMainComment(comment) ? comment.topping : false
  const [{ userId }] = useAtom(authAtom)

  return (
    <div
      className={clsx(
        className,
        'mb-2 flex items-center text-xs',
        'leading-[20px]', // 在无 <Tag> 时保持高度一致
      )}
    >
      <div className={clsx('mr-2', userId === uploaderId && 'font-bold')}>
        <UserName userId={uploaderId}>{uploader}</UserName>
      </div>
      <div className="text-slate-500" title={formatDateTime(uploadTime)}>
        {formatRelativeTime(uploadTime)}
      </div>
      {topping && (
        <Tag minimal className="ml-2" intent="primary" icon="pin">
          置顶
        </Tag>
      )}
    </div>
  )
}

const CommentContent = ({
  className,
  comment: { message },
}: {
  className?: string
  comment: CommentInfo
}) => {
  return <Markdown className={clsx(className)}>{message}</Markdown>
}

const CommentActions = ({
  className,
  comment,
}: {
  className?: string
  comment: CommentInfo
}) => {
  const [{ userId }] = useAtom(authAtom)
  const { operationOwned, replyTo, setReplyTo, reload } =
    useContext(CommentAreaContext)
  const maxLength = operationOwned
    ? AUTHOR_MAX_COMMENT_LENGTH
    : MAX_COMMENT_LENGTH

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    if (pending) {
      return
    }

    setPending(true)

    await wrapErrorMessage(
      (e) => '评分失败：' + formatError(e),
      deleteComment({ commentId: comment.commentId }),
    ).catch(console.warn)

    reload()
    setPending(false)
  }

  return (
    <div>
      <div
        className={clsx(
          className,
          'mt-2 -ml-1.5 flex items-center space-x-2 [&_*]:!text-slate-400',
        )}
      >
        <CommentRatingButtons comment={comment} />
        <Button
          minimal
          small
          className="!font-normal !text-[13px]"
          active={replyTo === comment}
          onClick={() => setReplyTo(replyTo === comment ? undefined : comment)}
        >
          回复
        </Button>
        {operationOwned && isMainComment(comment) && (
          <CommentTopButton comment={comment} />
        )}
        {(operationOwned || userId === comment.uploaderId) && (
          <Button
            minimal
            small
            className="!font-normal !text-[13px]"
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
        <CommentForm inputAutoFocus className="mt-4" maxLength={maxLength} />
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

    await wrapErrorMessage(
      (e) => '评分失败：' + formatError(e),
      rateComment({ commentId, rating }),
    ).catch(console.warn)

    reload()
    setPending(false)
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

const CommentTopButton = ({ comment }: { comment: MainCommentInfo }) => {
  const { commentId, topping } = comment
  const { reload } = useContext(CommentAreaContext)

  const [pending, setPending] = useState(false)

  const top = async () => {
    if (pending) {
      return
    }

    setPending(true)

    await wrapErrorMessage(
      (e) => '置顶失败：' + formatError(e),
      topComment({ commentId, topping: !topping }),
    ).catch(console.warn)

    reload()
    setPending(false)
  }

  return (
    <Button minimal small className="!font-normal !text-[13px]" onClick={top}>
      {topping ? '取消置顶' : '置顶'}
    </Button>
  )
}
