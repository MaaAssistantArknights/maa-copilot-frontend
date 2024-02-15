import { Card, CardProps } from '@blueprintjs/core'

import clsx from 'clsx'

import { OperatorAvatar } from '../EditorOperator'
import { OperatorEventType } from '../EditorSheet'
import { SkillAboutProps, SkillAboutTrigger } from './SheetOperatorSkillAbout'

export interface OperatorItemPorps extends CardProps, SkillAboutProps {
  name: string
  selected: boolean
  horizontal?: boolean
  scaleDisable?: boolean
  readOnly?: boolean
}

export const OperatorItem = ({
  name,
  selected,
  operator,
  submitOperator,
  horizontal,
  scaleDisable,
  readOnly,
  ...cardProps
}: OperatorItemPorps) => (
  <Card
    className={clsx(
      'flex items-center w-full h-full relative cursor-pointer',
      selected && !scaleDisable && 'scale-90 bg-gray-200',
      !horizontal && 'flex-col justify-center',
    )}
    interactive={!selected}
    onClick={() =>
      submitOperator?.(OperatorEventType.BOX, operator || { name })
    }
    {...cardProps}
  >
    <>
      <OperatorAvatar name={name} size="large" />
      <p
        className={clsx(
          'font-bold leading-none text-center mt-3 truncate',
          horizontal && 'mt-0 ml-1 mr-auto',
        )}
      >
        {name}
      </p>
    </>
    {!readOnly && selected && (
      <SkillAboutTrigger {...{ operator, submitOperator }} />
    )}
  </Card>
)
