import { Button, TextArea } from '@blueprintjs/core'

import clsx from 'clsx'
import { useContext, useState } from 'react'

import { requestAddComment } from '../../../apis/comment'
import { MAX_COMMENT_LENGTH } from '../../../models/comment'
import { formatError } from '../../../utils/error'
import { wrapErrorMessage } from '../../../utils/wrapErrorMessage'
import { AppToaster } from '../../Toaster'
import { CommentAreaContext } from './CommentArea'

export interface CommentFormProps {
  className?: string
  embedded?: boolean
  placeholder?: string
  inputAutoFocus?: boolean
}

export const CommentForm = ({
  className,
  embedded,
  placeholder = '发表一条评论吧',
  inputAutoFocus,
}: CommentFormProps) => {
  const { operationId, replyTo, reload } = useContext(CommentAreaContext)

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      AppToaster.show({
        intent: 'primary',
        message: '请输入评论内容',
      })
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await wrapErrorMessage(
        (e) => '发表评论失败：' + formatError(e),
        requestAddComment(message, operationId, replyTo?.commentId),
      )

      setMessage('')
      reload()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={clsx(className)}>
      <TextArea
        fill
        rows={2}
        growVertically
        large
        maxLength={MAX_COMMENT_LENGTH}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={inputAutoFocus}
      />

      <div className="mt-2 flex flex-wrap items-center">
        <Button
          icon="send-message"
          intent="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {embedded ? '回复' : '发表评论'}
        </Button>

        <div className="ml-auto text-slate-500 text-sm">
          {message.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>
    </form>
  )
}
