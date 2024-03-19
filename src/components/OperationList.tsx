import { Button, NonIdealState } from '@blueprintjs/core'

import { UseOperationsParams, useOperations } from 'apis/operation'
import { ComponentType, ReactNode, useMemo } from 'react'

import { toCopilotOperation } from '../models/converter'
import { CopilotDocV1 } from '../models/copilot.schema'
import { Operation } from '../models/operation'
import { NeoOperationCard, OperationCard } from './OperationCard'
import { withSuspensable } from './Suspensable'

export const OperationList: ComponentType<
  UseOperationsParams & { neoLayout?: boolean }
> = withSuspensable(
  (props) => {
    const { operations, setSize, isValidating, isReachingEnd } = useOperations({
      ...props,
      suspense: true,
    })

    // make TS happy: we got Suspense out there
    if (!operations) throw new Error('unreachable')

    const docCache = useMemo(
      () => new WeakMap<Operation, CopilotDocV1.Operation>(),
      [],
    )
    const operationsWithDoc = operations?.map((operation) => {
      let doc = docCache.get(operation)
      if (!doc) {
        doc = toCopilotOperation(operation)
        docCache.set(operation, doc)
      }
      return { operation, doc }
    })

    const { neoLayout = true } = props

    const items: ReactNode = neoLayout ? (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr)' }}
      >
        {operationsWithDoc.map(({ operation, doc }) => (
          <NeoOperationCard
            operation={operation}
            operationDoc={doc}
            key={operation.id}
          />
        ))}
      </div>
    ) : (
      operationsWithDoc.map(({ operation, doc }) => (
        <OperationCard
          operation={operation}
          operationDoc={doc}
          key={operation.id}
        />
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
