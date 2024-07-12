import { Button, Card, CardProps, Icon } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { FC } from 'react'

import { OperatorAvatar } from '../EditorOperator'
import { Operator } from '../EditorSheet'
import { OperatorModifyProps } from './SheetOperator'
import { SkillAboutProps, SkillAboutTrigger } from './SheetOperatorSkillAbout'
import { useSheet } from './SheetProvider'

export interface OperatorItemPorps extends CardProps, SkillAboutProps {
  name: string
  selected: boolean
  horizontal?: boolean
  scaleDisable?: boolean
  readOnly?: boolean
  pinned?: boolean
  onPinHandle?: OperatorModifyProps['operatorPinHandle']
}

export const OperatorItem = ({
  name,
  selected,
  operator,
  horizontal,
  scaleDisable,
  readOnly,
  onSkillChange,
  onPinHandle,
  pinned,
  ...cardProps
}: OperatorItemPorps) => {
  return (
    <Card
      className={clsx(
        'flex items-center w-full h-full relative cursor-pointer',
        selected && !scaleDisable && 'scale-90 bg-gray-200',
        !horizontal && 'flex-col justify-center',
      )}
      interactive={!selected}
      {...cardProps}
    >
      <>
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
        {!horizontal && selected && !!onPinHandle && (
          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Popover2
              content={
                <Button
                  minimal
                  onClick={() => onPinHandle?.(operator as Operator)}
                >
                  <Icon icon="pin" className="-rotate-45" />
                  <span>移出收藏</span>
                </Button>
              }
              disabled={!pinned}
            >
              <Icon
                icon={pinned ? 'pin' : 'unpin'}
                className={clsx(pinned && '-rotate-45')}
                onClick={
                  pinned ? undefined : () => onPinHandle?.(operator as Operator)
                }
              />
            </Popover2>
          </div>
        )}
      </>
      {!readOnly && selected && (
        <SkillAboutTrigger {...{ operator, onSkillChange }} />
      )}
    </Card>
  )
}

// export interface OperatorItemV2Prop {
//   name: string
//   selected: boolean
//   grouped: boolean
//   simpleMode: boolean
// }

// export const OperatorItemV2: FC<OperatorItemV2Prop> = ({
//   name,
//   selected,
//   grouped,
// }) => {
//   const horizontal = selected && grouped
//   const { existedOperators, existedGroups } = useSheet()

//   return <>111</>
// }
