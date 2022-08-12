import { Card, Elevation, NonIdealState } from '@blueprintjs/core'
import clsx from 'clsx'
import { CardTitle } from 'components/CardTitle'
import { FactItem } from 'components/FactItem'
import { findActionType } from 'models/types'
import { FC } from 'react'
import { FCC } from 'types'
import { formatDuration } from 'utils/times'

const actionKey = (action: CopilotDocV1.Action) =>
  `${action.type}_${action.kills}_${action.costChanges}_${action.preDelay}_${action.rearDelay}_${action.direction}`

export const ViewerActions: FC<{
  className?: string
  actions?: CopilotDocV1.Action[]
}> = ({ className, actions }) => {
  if (!actions || !actions.length) return <EmptyAction />

  return (
    <div className="flex flex-col pb-8">
      {actions.map((action) => {
        const type = findActionType(action.type)
        return (
          <Card
            elevation={Elevation.ONE}
            className={clsx(
              'flex flex-col mb-2 last:mb-0 border-l-4',
              type.accent,
              className,
            )}
            key={actionKey(action)}
          >
            <CardTitle large className="mb-0" icon={type.icon}>
              <span className="text-xl">{type.title}</span>
              <span className="flex-1"></span>
              <div className="w-[50%] grid grid-flow-row grid-cols-4 text-right font-normal">
                <InlinePrecondition title="击杀">
                  {action.kills || '-'}
                </InlinePrecondition>

                <InlinePrecondition title="费用回复">
                  {action.costChanges || '-'}
                </InlinePrecondition>

                <InlinePrecondition title="动作前等待">
                  {action.preDelay ? formatDuration(action.preDelay) : '-'}
                </InlinePrecondition>

                <InlinePrecondition title="动作后等待">
                  {action.rearDelay ? formatDuration(action.rearDelay) : '-'}
                </InlinePrecondition>
              </div>
            </CardTitle>
            <div className="grid grid-flow-row grid-cols-4 gap-2 [&>*]:mt-4 w-full">
              {action.name && (
                <FactItem dense title="干员/干员组" icon="mugshot">
                  {action.name}
                </FactItem>
              )}

              {action.skillUsage !== undefined && (
                <FactItem dense title="切换技能用法至" icon="swap-horizontal">
                  {action.skillUsage}
                </FactItem>
              )}

              {!!action.location?.filter(Boolean).length && (
                <FactItem dense title="部署坐标" icon="map-marker">
                  <span className="font-mono">
                    {action.location?.[0]}, {action.location?.[1]}
                  </span>
                </FactItem>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

const InlinePrecondition: FCC<{
  title?: string
}> = ({ title, children }) => (
  <div className="inline-flex items-end">
    <span className="text-zinc-500 leading-none mr-0.5 tabular-nums font-bold">
      {children}
    </span>
    <span className="text-zinc-400 text-xs">{title}</span>
  </div>
)

const EmptyAction: FC<{
  title?: string
  description?: string
}> = ({ title = '暂无动作', description = '作业并未定义任何动作' }) => (
  <NonIdealState
    className="my-2"
    title={title}
    description={description}
    icon="slash"
    layout="horizontal"
  />
)
