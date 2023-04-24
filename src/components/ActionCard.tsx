import { Card, Elevation } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, ReactNode } from 'react'
import { FCC } from 'types'

import { CardTitle } from 'components/CardTitle'
import { FactItem } from 'components/FactItem'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { findActionType } from 'models/types'

import {
  findOperatorDirection,
  findOperatorSkillUsage,
} from '../models/operator'
import { formatDuration } from '../utils/times'

interface ActionCardProps {
  className?: string
  action: CopilotDocV1.Action
  title?: ReactNode
}

export const ActionCard: FC<ActionCardProps> = ({
  className,
  action,
  title,
}) => {
  const type = findActionType(action.type)

  title ??= (
    <div className="flex items-center">
      <CardTitle className="mb-0 flex-grow" icon={type.icon}>
        <span className="mr-2">{type.title}</span>
      </CardTitle>
    </div>
  )

  return (
    <Card
      elevation={Elevation.TWO}
      className={clsx(className, 'flex mb-2 last:mb-0 border-l-4', type.accent)}
    >
      <div className="flex-grow">
        {title}

        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 w-full">
          {'name' in action && action.name && (
            <FactItem
              dense
              title={action.name}
              icon="mugshot"
              className="font-bold"
            />
          )}

          {'skillUsage' in action && (
            <FactItem
              dense
              title={findOperatorSkillUsage(action.skillUsage).title}
              icon="swap-horizontal"
            />
          )}

          {'location' in action && action.location && (
            <FactItem dense title="坐标" icon="map-marker">
              <span className="font-mono">{action.location.join(', ')}</span>
            </FactItem>
          )}

          {'direction' in action && (
            <FactItem dense title="朝向" icon="compass">
              <span className="font-mono">
                {findOperatorDirection(action.direction).title}
              </span>
            </FactItem>
          )}

          {'distance' in action && action.distance && (
            <FactItem dense title="距离" icon="camera">
              <span className="font-mono">{action.distance.join(', ')}</span>
            </FactItem>
          )}
        </div>
      </div>

      {/* direction:rtl is for the grid to place columns from right to left; need to set it back to ltr for the children */}
      <div className="grid grid-flow-row grid-cols-2 gap-y-2 text-right [direction:rtl] [&>*]:[direction:ltr]">
        <InlineCondition title="击杀">{action.kills || '-'}</InlineCondition>
        <InlineCondition title="冷却中">
          {action.cooling || '-'}
        </InlineCondition>
        <InlineCondition title="费用">{action.costs || '-'}</InlineCondition>
        <InlineCondition title="费用变化">
          {action.costChanges || '-'}
        </InlineCondition>
        <InlineCondition title="前置">
          {action.preDelay ? formatDuration(action.preDelay) : '-'}
        </InlineCondition>
        <InlineCondition title="后置">
          {action.rearDelay ? formatDuration(action.rearDelay) : '-'}
        </InlineCondition>
      </div>
    </Card>
  )
}

const InlineCondition: FCC<{
  title?: string
}> = ({ title, children }) => (
  <div className="min-w-[5em] text-lg leading-none">
    <span className="text-zinc-500 mr-0.5 tabular-nums font-bold">
      {children}
    </span>
    <span className="text-zinc-400 text-xs">{title}</span>
  </div>
)
