import { Icon, IconSize } from '@blueprintjs/core'
import { Popover2InteractionKind, Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { FC } from 'react'
import Rating from 'react-rating'

import { Operation } from 'models/operation'
import { ratingLevelToString } from 'models/rating'

type PickedOperation = Pick<
  Operation,
  'notEnoughRating' | 'ratingRatio' | 'ratingLevel' | 'like' | 'dislike'
>

const GetLevelDescription: FC<{
  operation: PickedOperation
  layout?: 'horizontal' | 'vertical'
}> = ({ operation, layout }) => {
  return operation.notEnoughRating ? (
    layout === 'vertical' ? (
      <span>还没有足够的评分</span>
    ) : (
      <span>评分不足</span>
    )
  ) : (
    <Tooltip2
      className="!inline-block !mt-0"
      interactionKind={Popover2InteractionKind.HOVER}
      content={`有${Math.round(
        (operation.like / (operation.like + operation.dislike)) * 100,
      )}%的人为本作业点了个赞（${operation.like}/${
        operation.like + operation.dislike
      }）`}
      position="bottom-left"
    >
      {ratingLevelToString(operation.ratingLevel)}
    </Tooltip2>
  )
}

export const OperationRating: FC<{
  operation: PickedOperation
  layout?: 'horizontal' | 'vertical'
  className?: string
}> = ({ operation, layout = 'vertical', className }) => {
  return (
    <div
      className={clsx(
        'flex',
        layout === 'horizontal' && 'flex-row-reverse',
        layout === 'vertical' && 'flex-col',
        className,
      )}
    >
      {!operation.notEnoughRating && (
        <Rating
          initialRating={operation.ratingRatio * 5}
          fullSymbol={
            <Icon
              size={
                layout === 'horizontal' ? IconSize.STANDARD : IconSize.LARGE
              }
              icon="star"
              className="text-yellow-500"
            />
          }
          placeholderSymbol={
            <Icon
              size={
                layout === 'horizontal' ? IconSize.STANDARD : IconSize.LARGE
              }
              icon="star"
              className="text-yellow-500"
            />
          }
          emptySymbol={
            <Icon
              size={
                layout === 'horizontal' ? IconSize.STANDARD : IconSize.LARGE
              }
              icon="star-empty"
              className="text-zinc-600"
            />
          }
          readonly
        />
      )}
      <div
        className={clsx(
          'text-sm text-zinc-500',
          layout === 'horizontal' && !operation.notEnoughRating && 'mr-1.5',
        )}
      >
        <GetLevelDescription layout={layout} operation={operation} />
      </div>
    </div>
  )
}
