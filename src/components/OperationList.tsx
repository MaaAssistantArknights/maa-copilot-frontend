import { Button, NonIdealState } from '@blueprintjs/core'

import { useOperations, UseOperationsParams } from 'apis/query'
import { ComponentType } from 'react'

import { OperationCard } from './OperationCard'
import { withSuspensable } from './Suspensable'

export const OperationList: ComponentType<UseOperationsParams> =
  withSuspensable(
    (props) => {
      const { operations, size, setSize, isValidating, isReachingEnd } =
        useOperations(props)
      return (
        <>
          {operations?.map((operation) => (
            <OperationCard operation={operation} key={operation.id} />
          ))}

          {isReachingEnd && operations.length === 0 && (
            <NonIdealState
              icon="slash"
              title="没有找到任何作业"
              description="(つД｀)･ﾟ･"
            />
          )}

          {isReachingEnd && operations.length !== 0 && (
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
              onClick={() => setSize(size + 1)}
            />
          )}
        </>
      )
    },
    {
      retryOnChange: ['orderBy', 'document', 'levelKeyword', 'operator'],
    },
  )
