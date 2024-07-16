import { H6 } from '@blueprintjs/core'

import { Dispatch, FC, SetStateAction } from 'react'

import { PaginationFilter } from './useOperatorFilter'

export interface ShowMoreProp {
  pagination: PaginationFilter
  setPagination: Dispatch<SetStateAction<PaginationFilter>>
}

export const defaultPagination: PaginationFilter = {
  current: 1,
  size: 60,
  total: 0,
}

export const ShowMore: FC<ShowMoreProp> = ({
  pagination: { current, size, total },
  setPagination,
}) => {
  const lastIndex = current * size

  return (
    <div className="flex items-center justify-center pt-3 cursor-default">
      {lastIndex >= total ? (
        <>
          <H6>已经展示全部干员了({total})</H6>
          {total > size && (
            <H6
              className="ml-1 cursor-pointer text-sm text-gray-500 hover:text-inherit hover:underline"
              onClick={() => setPagination(defaultPagination)}
            >
              收起
            </H6>
          )}
        </>
      ) : (
        <H6
          className="cursor-pointer mx-auto text-sm text-gray-500 hover:text-inherit hover:underline"
          onClick={() =>
            setPagination(({ current, ...rest }) => ({
              ...rest,
              current: current + 1,
            }))
          }
        >
          显示更多干员(剩余{total - lastIndex})
        </H6>
      )}
    </div>
  )
}
