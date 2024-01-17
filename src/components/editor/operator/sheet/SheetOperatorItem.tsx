import { Card, CardProps } from '@blueprintjs/core'

import clsx from 'clsx'
import { useMemo } from 'react'

import { OperatorAvatar } from '../EditorOperator'
import { SkillAboutProps, SkillAboutTrigger } from './SkillAbout'

export interface OperatorItemPorps extends CardProps, SkillAboutProps {
  id: string
  name: string
  selected: boolean
}

export const OperatorItem = ({
  id,
  selected,
  name,
  operator,
  submitOperator,
  ...cardProps
}: OperatorItemPorps) => {
  const readOnly = useMemo(
    () => typeof submitOperator !== 'function',
    [submitOperator],
  )
  return (
    <Card
      className={clsx(
        'flex flex-col justify-center items-center w-full relative cursor-pointer',
        selected && 'scale-95 bg-gray-200',
      )}
      interactive={!selected}
      onClick={
        readOnly
          ? undefined
          : () => {
              submitOperator!('box', operator || { name })
            }
      }
      {...cardProps}
    >
      <OperatorAvatar id={id} size="large" />
      <h3 className="font-bold leading-none text-center mt-3 w-full truncate">
        {name}
      </h3>
      {!readOnly && <SkillAboutTrigger {...{ operator, submitOperator }} />}
    </Card>
  )
}
