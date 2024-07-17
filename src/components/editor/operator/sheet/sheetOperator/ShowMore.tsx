import { H6 } from '@blueprintjs/core'

import { Dispatch, FC, SetStateAction } from 'react'

import {
  PaginationFilter,
  useOperatorFilterProvider,
} from './SheetOperatorFilterProvider'

export interface ShowMoreProp {}

export const defaultPagination: PaginationFilter = {
  current: 1,
  size: 60,
}

export const ShowMore: FC<ShowMoreProp> = () => {
  const {
    operatorFiltered: {
      meta: { dataTotal },
    },
    usePaginationFilterState: [{ current, size }, setPagination],
  } = useOperatorFilterProvider()

  const lastIndex = current * size

  return (
    <div className="flex items-center justify-center pt-3 cursor-default">
      {lastIndex >= dataTotal ? (
        <>
          <H6>已经展示全部干员了({dataTotal})</H6>
          {dataTotal > size && (
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
          显示更多干员(剩余{dataTotal - lastIndex})
        </H6>
      )}
    </div>
  )
}
