import { Card, Elevation, Icon, NonIdealState } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, useMemo } from 'react'
import { FCC } from 'types'

import { CardTitle } from 'components/CardTitle'
import { FactItem } from 'components/FactItem'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { findActionType } from 'models/types'

import { formatDuration } from '../../utils/times'

const actionKey = (action: CopilotDocV1.Action, index?: number) =>
  `${index}_${action.type}_${'name' in action ? action.name : ''}_${
    action.kills
  }_${action.costChanges}_${action.preDelay}_${action.rearDelay}_${
    'location' in action ? action.location : ''
  }`

export const ViewerActions: FC<{
  className?: string
  actions?: CopilotDocV1.Action[]
}> = ({ className, actions }) => {
  if (!actions || !actions.length) return <EmptyAction />

  const patchedActions = useMemo(() => {
    return actions.map((action, index) => {
      const next = actions[index + 1]
      if (next) {
        action.rearDelay = (next.preDelay || 0) + (action.rearDelay || 0)
      }
      delete action.preDelay
      return action
    })
  }, [actions])

  return (
    <div className="flex flex-col pb-8">
      {patchedActions.map((action, i) => {
        const type = findActionType(action.type)
        return (
          <>
            <Card
              elevation={Elevation.ONE}
              className={clsx(
                'flex flex-col mb-2 last:mb-0 border-l-4',
                type.accent,
                className,
              )}
              key={actionKey(action, i)}
            >
              <CardTitle large className="mb-0" icon={type.icon}>
                <span className="text-xl">{type.title}</span>
                <span className="flex-1" />
                <div className="w-[25%] grid grid-flow-row grid-cols-2 text-right font-normal">
                  <InlinePrecondition title="击杀">
                    {action.kills || '-'}
                  </InlinePrecondition>

                  <InlinePrecondition title="费用回复">
                    {action.costChanges || '-'}
                  </InlinePrecondition>
                </div>
              </CardTitle>
              <div className="grid grid-flow-row grid-cols-4 gap-2 [&>*]:mt-4 w-full">
                {'name' in action && (
                  <FactItem dense title="干员/干员组" icon="mugshot">
                    {action.name}
                  </FactItem>
                )}

                {'skillUsage' in action && action.skillUsage !== undefined && (
                  <FactItem dense title="切换技能用法至" icon="swap-horizontal">
                    {action.skillUsage}
                  </FactItem>
                )}

                {'location' in action &&
                  !!action.location?.filter(Boolean).length && (
                    <FactItem dense title="坐标" icon="map-marker">
                      <span className="font-mono">
                        {action.location?.[0]}, {action.location?.[1]}
                      </span>
                    </FactItem>
                  )}

                {'direction' in action && (
                  <FactItem dense title="朝向" icon="compass">
                    <span className="font-mono">{action.direction}</span>
                  </FactItem>
                )}
              </div>
            </Card>
            {i < actions.length - 1 && (
              <div className="flex w-full justify-start items-center mb-2 select-none ml-0.5">
                <Icon
                  className="text-slate-400 mr-2"
                  icon="double-chevron-down"
                />
                {action.rearDelay ? (
                  <div className="flex items-center text-slate-500">
                    <Icon icon="time" className="mr-2" />
                    <span className="mr-1.5">等待时间</span>
                    <span className="mr-2">
                      {formatDuration(action.rearDelay)}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </>
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
