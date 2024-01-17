import { Button, Card, Collapse, Icon } from '@blueprintjs/core'

import { useMemo, useState } from 'react'
import { UseFormSetError } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS } from 'models/generated/operators'

import { OperatorItem } from '../SheetOperatorItem'

export type Group = CopilotDocV1.Group
export type EventType = 'add' | 'remove' | 'pin' | 'opers'

interface GroupItemProps {
  groupInfo: Group
  editable: boolean
  exist: boolean
  pinned: boolean
  eventHandleProxy: (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<CopilotDocV1.Operator>,
  ) => void
}

export const GroupItem = ({
  groupInfo,
  editable,
  exist,
  pinned,
  eventHandleProxy,
}: GroupItemProps) => {
  const [showOperators, setShowOperators] = useState(editable)
  const createOrDeleteGroup = () => {
    if (exist) {
      if (editable) eventHandleProxy('remove', groupInfo)
    } else eventHandleProxy('add', groupInfo)
  }

  const Operators = useMemo(
    () => (
      <div className="flex flex-wrap w-full pt-1">
        {groupInfo.opers?.map((item) => (
          <div className="w-1/4 p-1">
            <OperatorItem
              id={
                OPERATORS.find((opInfoitem) => opInfoitem.name === item.name)
                  ?.id || ''
              }
              name={item.name}
              selected={false}
              interactive={false}
            />
          </div>
        ))}
        {editable && (
          <div className="w-1/4 p-1">
            <Card className="h-full flex items-center justify-center">
              <Icon icon="plus" size={35} />
            </Card>
          </div>
        )}
      </div>
    ),
    [groupInfo.opers],
  )

  return (
    <Card interactive className="mt-1">
      <div className="flex items-center">
        <Icon icon="people" />
        <p className="ml-1">{groupInfo.name}</p>
        <div className="ml-auto flex items-center">
          <Button
            minimal
            icon={showOperators ? 'remove' : 'add'}
            title={`${showOperators ? '折叠' : '展开'}所包含干员`}
            className="cursor-pointer"
            onClick={() => setShowOperators(!showOperators)}
          />
          {editable ? (
            <CardDeleteOption
              className="cursor-pointer"
              onClick={createOrDeleteGroup}
            />
          ) : (
            <Button
              minimal
              icon={exist ? 'tick' : 'arrow-left'}
              title={exist ? '已选择' : '使用该推荐分组'}
              onClick={createOrDeleteGroup}
            />
          )}
          {editable && (
            <Button
              minimal
              icon={pinned ? 'star' : 'star-empty'}
              title={pinned ? `从收藏移除` : `添加至收藏`}
              onClick={() => eventHandleProxy('pin', groupInfo)}
            />
          )}
        </div>
      </div>
      <Collapse isOpen={showOperators}>{Operators}</Collapse>
    </Card>
  )
}
