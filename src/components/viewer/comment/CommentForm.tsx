import { Button, Card, Checkbox, TextArea } from '@blueprintjs/core'

import { sendComment } from 'apis/comment'
import clsx from 'clsx'
import { useContext, useState } from 'react'

import { MAX_COMMENT_LENGTH } from '../../../models/comment'
import { formatError } from '../../../utils/error'
import { wrapErrorMessage } from '../../../utils/wrapErrorMessage'
import { Markdown } from '../../Markdown'
import { AppToaster } from '../../Toaster'
import { CommentAreaContext } from './CommentArea'

export interface CommentFormProps {
  className?: string
  primary?: boolean
  placeholder?: string
  inputAutoFocus?: boolean
}

export const CommentForm = ({
  className,
  primary,
  placeholder = '发一条友善的评论吧',
  inputAutoFocus,
}: CommentFormProps) => {
  const { operationId, replyTo, reload } = useContext(CommentAreaContext)

  const [message, setMessage] = useState('')
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
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
        (async () => {
          if (primary) {
            // this comment is a main comment and does not reply to others
            await sendComment({ message, operationId })
          } else {
            if (!replyTo) {
              throw new Error('要回复的评论不存在')
            }
            await sendComment({
              message,
              operationId,
              fromCommentId: replyTo?.commentId,
            })
          }
        })(),
      )

      AppToaster.show({
        intent: 'success',
        message: `发表成功`,
      })

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
          {primary ? '发表评论' : '回复'}
        </Button>

        <Checkbox
          className="mb-0 ml-6"
          checked={showMarkdownPreview}
          onChange={(e) =>
            setShowMarkdownPreview((e.target as HTMLInputElement).checked)
          }
        >
          预览 Markdown
        </Checkbox>

        <div className="ml-auto text-slate-500 text-sm">
          {message.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>

      {showMarkdownPreview && (
        <Card className="mt-2 border-2">
          <Markdown>{message || '*没有内容*'}</Markdown>
        </Card>
      )}
    </form>
  )
}
