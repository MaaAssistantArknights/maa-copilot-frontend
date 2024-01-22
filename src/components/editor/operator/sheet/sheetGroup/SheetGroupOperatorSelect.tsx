import { Button, Card, Collapse, Icon, NonIdealState } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { useMemo, useState } from 'react'
import { UseFormSetError } from 'react-hook-form'

import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS } from 'models/generated/operators'

import { SheetContainerSkeleton } from '../SheetContainerSkeleton'
import { OperatorItem } from '../SheetOperatorItem'

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
  const [groupInfoOperators, setGroupInfoOperators] = useState(
    groupInfo.opers || [],
  )
  const [noneGroupedOperators, setNoneGroupedOperators] = useState(
    existedOperator || [],
  )
  const checkGroupedOperator = (target: string) =>
    groupInfoOperators.find(({ name }) => name === target) ? true : false
  const checkNoneGroupedOperator = (target: string) =>
    noneGroupedOperators.find(({ name }) => name === target) ? true : false
  const groupedOperatorHandle = (target: Operator) => {
    if (checkGroupedOperator(target.name))
      setGroupInfoOperators(
        groupInfoOperators.filter(({ name }) => name !== target.name),
      )
    else setGroupInfoOperators([...groupInfoOperators, target])
  }
  const noneGroupedOperatorHandle = (target: Operator) => {
    if (checkNoneGroupedOperator(target.name))
      setNoneGroupedOperators(
        noneGroupedOperators.filter(({ name }) => name !== target.name),
      )
    else setNoneGroupedOperators([...noneGroupedOperators, target])
  }
  const [selectedCloseState, setSelectedCloseState] = useState(true)
  const [groupCloseState, setGroupCloseState] = useState(true)
  const [noneGroupedCloseState, setNoneGroupedCloseState] = useState(true)
  const GroupedOperatorsPart = useMemo(
    () => (
      <div className="flex flex-wrap">
        {groupInfo.opers?.map((item) => (
          <div className="w-1/4 relative p-0.5">
            <OperatorItem
              id={
                OPERATORS.find((opInfoitem) => opInfoitem.name === item.name)
                  ?.id || ''
              }
              name={item.name}
              selected={checkGroupedOperator(item.name)}
              onClick={() => groupedOperatorHandle(item)}
            />
          </div>
        ))}
      </div>
    ),
    [groupInfo.opers, groupInfoOperators],
  )
  const NoneGroupedOperatorsPart = useMemo(
    () => (
      <div className="flex flex-wrap">
        {existedOperator?.map((item) => (
          <div className="w-1/4 relative p-0.5">
            <OperatorItem
              id={
                OPERATORS.find((opInfoitem) => opInfoitem.name === item.name)
                  ?.id || ''
              }
              name={item.name}
              selected={checkNoneGroupedOperator(item.name)}
              onClick={() => noneGroupedOperatorHandle(item)}
            />
          </div>
        ))}
      </div>
    ),
    [existedOperator, noneGroupedOperators],
  )
  const ButtonGroup = useMemo(
    () => (
      <div className="w-full flex">
        <Button>确认</Button>
      </div>
    ),
    [],
  )
  return (
    <SheetContainerSkeleton title="选择干员" icon="select">
      <SheetContainerSkeleton
        title="已选择"
        icon="person"
        mini
        className="w-96"
        rightOptions={
          <Button
            minimal
            icon={selectedCloseState ? 'remove' : 'add'}
            title={`${selectedCloseState ? '折叠' : '展开'}所包含干员`}
            className="cursor-pointer ml-1"
            onClick={() => setSelectedCloseState(!selectedCloseState)}
          />
        }
      >
        {groupInfo.opers?.length ? (
          <Collapse isOpen={selectedCloseState}>
            {GroupedOperatorsPart}
          </Collapse>
        ) : (
          <NonIdealState title="暂无干员" />
        )}
      </SheetContainerSkeleton>
      <SheetContainerSkeleton
        title="未分组干员"
        icon="person"
        mini
        className="w-96"
        rightOptions={
          <Button
            minimal
            icon={noneGroupedCloseState ? 'remove' : 'add'}
            title={`${noneGroupedCloseState ? '折叠' : '展开'}所包含干员`}
            className="cursor-pointer ml-1"
            onClick={() => setNoneGroupedCloseState(!noneGroupedCloseState)}
          />
        }
      >
        {groupInfo.opers?.length ? (
          <Collapse isOpen={noneGroupedCloseState}>
            {NoneGroupedOperatorsPart}
          </Collapse>
        ) : (
          <NonIdealState title="暂无干员" />
        )}
      </SheetContainerSkeleton>
      <SheetContainerSkeleton
        title="其它干员组干员"
        icon="people"
        mini
        rightOptions={
          <Button
            minimal
            icon={groupCloseState ? 'remove' : 'add'}
            title={`${groupCloseState ? '折叠' : '展开'}所包含干员`}
            className="cursor-pointer ml-1"
            onClick={() => setGroupCloseState(!groupCloseState)}
          />
        }
      >
        111
      </SheetContainerSkeleton>

      {ButtonGroup}
    </SheetContainerSkeleton>
  )
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
