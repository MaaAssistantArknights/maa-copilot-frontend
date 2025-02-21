import { Button, NonIdealState } from '@blueprintjs/core'

import {
  UseOperationSetsParams,
  useOperationSetSearch,
} from 'apis/operation-set'
import { useAtomValue } from 'jotai'
import { ComponentType, ReactNode, useEffect } from 'react'

import { neoLayoutAtom } from 'store/pref'

import { NeoOperationSetCard, OperationSetCard } from './OperationSetCard'
import { withSuspensable } from './Suspensable'

interface OperationSetListProps extends UseOperationSetsParams {
  onUpdate?: (params: { total: number }) => void
}

export const OperationSetList: ComponentType<OperationSetListProps> =
  withSuspensable(
    ({ onUpdate, ...params }) => {
      const neoLayout = useAtomValue(neoLayoutAtom)

      const { operationSets, total, setSize, isValidating, isReachingEnd } =
        useOperationSetSearch({ ...params, suspense: true })

      // make TS happy: we got Suspense out there
      if (!operationSets) throw new Error('unreachable')

      useEffect(() => {
        onUpdate?.({ total })
      }, [total, onUpdate])

      const items: ReactNode = neoLayout ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr)',
          }}
        >
          {operationSets?.map((operationSet) => (
            <NeoOperationSetCard
              operationSet={operationSet}
              key={operationSet.id}
            />
          ))}
        </div>
      ) : (
        operationSets.map((operationSet) => (
          <OperationSetCard operationSet={operationSet} key={operationSet.id} />
        ))
      )

      return (
        <>
          {items}

          {isReachingEnd && operationSets.length === 0 && (
            <NonIdealState
              icon="slash"
              title="没有找到任何作业集"
              description="(つД｀)･ﾟ･"
            />
          )}

          {isReachingEnd && operationSets.length !== 0 && (
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
      retryOnChange: ['keyword'],
    },
  )
