import {
  Button,
  ButtonProps,
  Card,
  Classes,
  Collapse,
  H6,
  Icon,
  Intent,
  NonIdealState,
  Position,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { UseFormSetError } from 'react-hook-form'

import { Group, Operator } from '../../EditorSheet'
import { SheetContainerSkeleton } from '../SheetContainerSkeleton'
import { EventType } from '../SheetGroup'
import { OperatorItem } from '../SheetOperatorItem'

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
  const otherGroupInfo = useMemo(
    () =>
      existedGroup?.filter(
        (item) => item._id !== groupInfo._id && item.opers?.length,
      ),
    [existedGroup],
  )
  const checkGroupedOperator = (target: string) =>
    !!groupInfoOperators.find(({ name }) => name === target)
  const groupedOperatorHandle = (target: Operator) => {
    if (checkGroupedOperator(target.name))
      setGroupInfoOperators(
        groupInfoOperators.filter(({ name }) => name !== target.name),
      )
    else setGroupInfoOperators([...groupInfoOperators, target])
  }
  const [selectedCloseState, setSelectedCloseState] = useState(true)
  const [groupCloseState, setGroupCloseState] = useState(true)
  const [noneGroupedCloseState, setNoneGroupedCloseState] = useState(true)
  const resetHandle = () => {
    setGroupInfoOperators(groupInfo.opers || [])
  }
  const submitHandle = () => {
    eventHandleProxy('opers', {
      ...groupInfo,
      ...{ opers: groupInfoOperators },
    })
  }

  const GroupedOperatorsPart = useMemo(
    () => (
      <div className="flex flex-wrap">
        {groupInfo.opers?.map((item) => (
          <div className="w-1/4 relative p-0.5" key={item.name}>
            <OperatorItem
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
          <div className="w-1/4 relative p-0.5" key={item.name}>
            <OperatorItem
              name={item.name}
              selected={checkGroupedOperator(item.name)}
              onClick={() => groupedOperatorHandle(item)}
            />
          </div>
        ))}
      </div>
    ),
    [existedOperator, groupInfoOperators],
  )
  const OtherGroupedOperatorsPart = useMemo(
    () => (
      <div>
        {otherGroupInfo?.map((item) => {
          return (
            <div key={item.name}>
              <div className="flex flex-row-reverse items-center">
                <H6 className="p-0 m-0">{item.name}</H6>
                <Button
                  minimal
                  icon="arrow-top-left"
                  title="全选"
                  onClick={() =>
                    setGroupInfoOperators([
                      ...groupInfoOperators,
                      ...(item.opers || []),
                    ])
                  }
                />
              </div>
              <OperatorPart
                operators={item.opers}
                selectCheckHandle={checkGroupedOperator}
                selectClickHandle={groupedOperatorHandle}
              />
            </div>
          )
        })}
      </div>
    ),
    [otherGroupInfo, groupInfoOperators],
  )
  const ButtonGroup = useMemo(
    () => (
      <div className="flex mt-3">
        <Button
          text="确认"
          className={Classes.POPOVER_DISMISS}
          onClick={submitHandle}
        />
        <Popover2
          captureDismiss
          content={
            <div className="flex items-center">
              <p>所有未保存的数据均会丢失，确认继续？</p>
              <Button
                onClick={resetHandle}
                text="继续"
                className={clsx(Classes.POPOVER_DISMISS, 'mx-1')}
              />
              <Button text="取消" className={Classes.POPOVER_DISMISS} />
            </div>
          }
          position={Position.TOP}
        >
          <Button intent={Intent.DANGER} className="ml-1" text="重置" />
        </Popover2>
      </div>
    ),
    [groupInfoOperators],
  )
  return (
    <SheetContainerSkeleton title="选择干员" icon="select">
      <div className="max-h-96 overflow-y-auto overflow-x-hidden">
        <SheetContainerSkeleton
          title="已选择"
          icon="person"
          mini
          className="w-96"
          rightOptions={
            <CollapseButton
              isCollapse={selectedCloseState}
              onClick={() => setSelectedCloseState(!selectedCloseState)}
              disabled={!groupInfo.opers}
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
            <CollapseButton
              isCollapse={noneGroupedCloseState}
              onClick={() => setNoneGroupedCloseState(!noneGroupedCloseState)}
              disabled={!existedOperator?.length}
            />
          }
        >
          {existedOperator?.length ? (
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
            <CollapseButton
              isCollapse={groupCloseState}
              onClick={() => setGroupCloseState(!groupCloseState)}
              disabled={!otherGroupInfo?.length}
            />
          }
        >
          {(existedGroup?.length || 0) > 1 ? (
            <Collapse isOpen={groupCloseState}>
              {OtherGroupedOperatorsPart}
            </Collapse>
          ) : (
            <NonIdealState title="暂无干员" />
          )}
        </SheetContainerSkeleton>
      </div>
      {ButtonGroup}
    </SheetContainerSkeleton>
  )
}

export const SheetGroupOperatorSelectTrigger = (
  sheetGroupOperatorSelectProp: SheetGroupOperatorSelectProp,
) => (
  <Popover2
    className="w-full mt-1"
    content={<SheetGroupOperatorSelect {...sheetGroupOperatorSelectProp} />}
  >
    <Card className="flex items-center justify-center">
      <Icon icon="plus" size={30} />
    </Card>
  </Popover2>
)

interface CollapseButtonProps extends ButtonProps {
  isCollapse: boolean
}

export const CollapseButton = ({
  isCollapse,
  ...buttonProps
}: CollapseButtonProps) => (
  <Button
    {...{
      ...buttonProps,
      ...{
        icon: isCollapse ? 'collapse-all' : 'expand-all',
        title: `${isCollapse ? '折叠' : '展开'}所包含干员`,
        minimal: true,
        className: 'cursor-pointer ml-1',
      },
    }}
  />
)

interface OperatorPartProp {
  operators?: Operator[]
  selectCheckHandle: (target: string) => boolean
  selectClickHandle: (target: Operator) => void
}

const OperatorPart = ({
  operators,
  selectCheckHandle,
  selectClickHandle,
}: OperatorPartProp) => (
  <div className="flex flex-wrap">
    {operators ? (
      operators?.map((item) => (
        <div className="w-1/4 relative p-0.5" key={item._id}>
          <OperatorItem
            name={item.name}
            selected={selectCheckHandle(item.name)}
            onClick={() => selectClickHandle(item)}
          />
        </div>
      ))
    ) : (
      <NonIdealState title="暂无干员" />
    )}
  </div>
)
