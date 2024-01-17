import {
  Button,
  Card,
  Collapse,
  Divider,
  Icon,
  NonIdealState,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/generated/operators'
import { favGroupAtom } from 'store/useFavGroups'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorItem } from './SheetOperatorItem'

type Group = CopilotDocV1.Group
type Operators = CopilotDocV1.Operator[]

export interface SheetGroupProps {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Group[]
  existedOperators: Operators
  removeGroup: UseFieldArrayRemove
}

type EventType = 'add' | 'remove' | 'pin' | 'opers'

const SheetGroup = ({
  submitGroup,
  existedGroups,
  existedOperators,
  removeGroup,
}: SheetGroupProps) => {
  const defaultGroup = useMemo<Group[]>(() => {
    const result: CopilotDocV1.Group[] = []
    PROFESSIONS.forEach((proItem) => {
      proItem.sub.forEach((subProItem) => {
        const operators = existedOperators.filter(
          (opItem) =>
            OPERATORS.find((opInfoItem) => opInfoItem.name === opItem.name)
              ?.subProf === subProItem.id,
        )
        if (operators.length)
          result.push({
            name: proItem.name + '-' + subProItem.name,
            opers: operators,
          })
      })
    })
    const otherOperators = existedOperators.filter(
      (opItem) =>
        !OPERATORS.find((opInfoItem) => opInfoItem.name === opItem.name),
    )
    if (otherOperators.length)
      result.push({
        name: '其它',
        opers: otherOperators,
      })
    return result
  }, [existedOperators])
  const checkGroupExisted = (target: string) =>
    existedGroups.find((item) => item.name === target) ? true : false
  const checkGroupPinned = (target: string) =>
    favGroups.find((item) => item.name === target) ? true : false
  const eventHandleProxy = (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<CopilotDocV1.Operator>,
  ) => {
    switch (type) {
      case 'add': {
        submitGroup(value, () => {})
        break
      }
      case 'remove': {
        removeGroup(existedGroups.findIndex((item) => item._id === value._id))
        break
      }
      case 'pin': {
        if (checkGroupPinned(value.name))
          setFavGroups([...favGroups].filter(({ name }) => name !== value.name))
        else setFavGroups([...favGroups, value])
        break
      }
      case 'opers': {
        break
      }
    }
  }
  const [favGroups, setFavGroups] = useAtom(favGroupAtom)

  return (
    <div className="flex min-h-screen px-1">
      <div className="flex-1">
        <SheetContainerSkeleton title="已设置的分组" icon="cog" mini>
          <div>
            {existedGroups.length
              ? existedGroups.map((item) => (
                  <GroupItem
                    groupInfo={item}
                    editable
                    exist={checkGroupExisted(item.name)}
                    pinned={checkGroupPinned(item.name)}
                    eventHandleProxy={eventHandleProxy}
                  />
                ))
              : GroupNoData}
          </div>
        </SheetContainerSkeleton>
      </div>
      <Divider />
      <div className="sticky top-0 flex-1">
        <SheetContainerSkeleton title="推荐分组" icon="thumbs-up" mini>
          <div>
            {defaultGroup.length
              ? defaultGroup.map((item) => (
                  <GroupItem
                    groupInfo={item}
                    editable={false}
                    exist={checkGroupExisted(item.name)}
                    eventHandleProxy={eventHandleProxy}
                    pinned={checkGroupPinned(item.name)}
                  />
                ))
              : GroupNoData}
          </div>
        </SheetContainerSkeleton>
        <SheetContainerSkeleton title="收藏分组" icon="star" mini>
          <div>
            {favGroups.length
              ? favGroups.map((item) => (
                  <GroupItem
                    groupInfo={item}
                    editable={false}
                    exist={checkGroupExisted(item.name)}
                    eventHandleProxy={eventHandleProxy}
                    pinned={checkGroupPinned(item.name)}
                  />
                ))
              : GroupNoData}
          </div>
        </SheetContainerSkeleton>
      </div>
    </div>
  )
}

export const SheetGroupContainer = (sheetGroupProps: SheetGroupProps) => (
  <SheetContainerSkeleton title="设置分组" icon="people">
    <SheetGroup {...sheetGroupProps} />
  </SheetContainerSkeleton>
)

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

const GroupItem = ({
  groupInfo,
  editable,
  exist,
  pinned,
  eventHandleProxy,
}: GroupItemProps) => {
  const [showOperators, setShowOperators] = useState(editable)
  const clickHandle = () => {
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
              onClick={clickHandle}
            />
          ) : (
            <Button
              minimal
              icon={exist ? 'tick' : 'arrow-left'}
              title={exist ? '已选择' : '使用该推荐分组'}
              onClick={clickHandle}
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

const GroupNoData = <NonIdealState title="暂无干员组" />
