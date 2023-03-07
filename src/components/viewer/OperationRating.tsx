import { Icon, IconSize } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC } from 'react'
import Rating from 'react-rating'

import { Operation } from 'models/operation'
import { ratingLevelToString } from 'models/rating'

export const OperationRating: FC<{
  operation: Pick<Operation, 'notEnoughRating' | 'ratingRatio' | 'ratingLevel'>
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
        {operation.notEnoughRating
          ? layout === 'vertical'
            ? '还没有足够的评分'
            : '评分不足'
          : ratingLevelToString(operation.ratingLevel)}
      </div>
    </div>
  )
}
