import { Button, NonIdealState } from '@blueprintjs/core'

import { UseOperationsParams, useOperations } from 'apis/operation'
import { useAtomValue } from 'jotai'
import { ComponentType, ReactNode } from 'react'

import { neoLayoutAtom } from 'store/pref'

import { NeoOperationCard, OperationCard } from './OperationCard'
import { withSuspensable } from './Suspensable'

export const OperationList: ComponentType<UseOperationsParams> =
  withSuspensable(
    (props) => {
      const neoLayout = useAtomValue(neoLayoutAtom)
      const { operations, setSize, isValidating, isReachingEnd, mutate } =
        useOperations({
          ...props,
          suspense: true,
        })

      // make TS happy: we got Suspense out there
      if (!operations) throw new Error('unreachable')

      const updateOperation = async (id, ratingType) => {
        mutate((val) => {
          if (!val || !Array.isArray(val)) return val;
          return val.map((page) => {
            if ('data' in page && Array.isArray(page.data)) {
              const updatedData = page.data.map((operation) =>
                operation.id === id
                  ? { ...operation, ratingType: ratingType }
                  : operation
              );
              return {
                ...page,
                data: updatedData,
                page: ('page' in page ? page.page : 1),
                total: ('total' in page ? page.total : 0),
              };
            }
            return page;
          });
        }, false);
      }

      const items: ReactNode = neoLayout ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr)',
          }}
        >
          {operations.map((operation) => (
            <NeoOperationCard operation={operation} key={operation.id} updateOperation={updateOperation} />
          ))}
        </div>
      ) : (
        operations.map((operation) => (
          <OperationCard operation={operation} key={operation.id} updateOperation={updateOperation} />
        ))
      )

      return (
        <>
          {items}

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
              onClick={() => setSize((size) => size + 1)}
            />
          )}
        </>
      )
    },
    {
      retryOnChange: ['orderBy', 'keyword', 'levelKeyword', 'operator'],
    },
  )