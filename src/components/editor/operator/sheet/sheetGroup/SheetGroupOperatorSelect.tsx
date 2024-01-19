import { Card, Icon } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { useState } from 'react'
import { UseFormSetError } from 'react-hook-form'

import { CopilotDocV1 } from 'models/copilot.schema'

export type EventType = 'add' | 'remove' | 'pin' | 'opers' | 'rename'

export type Group = CopilotDocV1.Group
type Operator = CopilotDocV1.Operator

export interface SheetGroupOperatorSelectProp {
  existedOperator?: Operator[]
  existedGroup?: Group[]
  groupInfo: Group
  eventHandleProxy: (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<Group>,
  ) => void
}

const SheetGroupOperatorSelect = ({
  existedGroup,
  existedOperator,
  groupInfo,
  eventHandleProxy,
}: SheetGroupOperatorSelectProp) => {
  return <div>111</div>
}

export const SheetGroupOperatorSelectTrigger = (
  sheetGroupOperatorSelectProp: SheetGroupOperatorSelectProp,
) => {
  //   const [popoverState, setPopverState] = useState(false)
  return (
    <Popover2
      className="h-full"
      content={<SheetGroupOperatorSelect {...sheetGroupOperatorSelectProp} />}
    >
      <Card className="h-full flex items-center justify-center">
        <Icon icon="plus" size={35} />
      </Card>
    </Popover2>
  )
}
