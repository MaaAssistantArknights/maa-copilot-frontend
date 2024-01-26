import {
  Button,
  Divider,
  InputGroup,
  Intent,
  NonIdealState,
  Position,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/generated/operators'
import { favGroupAtom } from 'store/useFavGroups'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { GroupItem } from './sheetGroup/SheetGroupItem'
import { EventType, Group } from './sheetGroup/SheetGroupOperatorSelect'

type Operator = CopilotDocV1.Operator

export interface SheetGroupProps {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Group[]
  existedOperators: Operator[]
  removeGroup: UseFieldArrayRemove
}

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
        if (operators.length) {
          const groupName = proItem.name + '-' + subProItem.name
          if (!existedGroups.find(({ name }) => name === groupName))
            result.push({
              name: groupName,
              opers: operators,
            })
        }
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
  const checkGroupPinned = (target: Group) => {
    const checkTarget = favGroups.find((item) => item.name === target.name)
    if (checkTarget) {
      if ((checkTarget.opers?.length || 0) === (target.opers?.length || 0)) {
        const ignoreKeyDic = ['_id', 'id']
        for (const aItem of checkTarget.opers!) {
          if (
            target.opers?.find((bItem) => {
              for (const [key, value] of Object.entries(bItem)) {
                if (
                  ignoreKeyDic.find((item) => item === key) ||
                  value === aItem[key]
                )
                  continue
                return false
              }
              return true
            })
          )
            continue
          else return false
        }
        return true
      } else return false
    } else return false
  }
  const changeOperatorOfOtherGroups = (
    target: Operator[] | undefined,
    errHandle: UseFormSetError<Group>,
  ) => {
    target?.forEach((item) => {
      existedGroups.forEach((groupItem) => {
        const oldLength = groupItem.opers?.length || 0
        if (oldLength) {
          groupItem.opers = groupItem.opers?.filter(
            (operItem) => operItem.name !== item.name,
          )
          if (groupItem.opers?.length !== oldLength)
            submitGroup(groupItem, errHandle, true)
        }
      })
    })
  }
  const eventHandleProxy = (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<Group>,
  ) => {
    const errHandle = setError || function () {}
    switch (type) {
      case 'add': {
        if (checkGroupExisted(value.name)) {
          AppToaster().show({
            message: '干员组已存在！',
            intent: Intent.DANGER,
          })
        } else {
          if (checkGroupPinned(value))
            changeOperatorOfOtherGroups(value.opers, errHandle)
          submitGroup(value, errHandle)
        }
        break
      }
      case 'remove': {
        removeGroup(existedGroups.findIndex((item) => item._id === value._id))
        break
      }
      case 'pin': {
        if (checkGroupPinned(value))
          setFavGroups([...favGroups].filter(({ name }) => name !== value.name))
        else {
          setFavGroups([
            ...[...favGroups].filter(({ name }) => name !== value.name),
            { ...value },
          ])
        }
        break
      }
      case 'rename': {
        submitGroup(value, errHandle, true)
        break
      }
      case 'opers': {
        changeOperatorOfOtherGroups(value.opers, errHandle)
        submitGroup(value, errHandle, true)
        break
      }
      case 'update': {
        submitGroup(value, errHandle, true)
        break
      }
    }
  }
  const [favGroups, setFavGroups] = useAtom(favGroupAtom)
  const EditorGroupName = () => {
    const [groupName, setGroupName] = useState('')
    const addGroupHandle = () => {
      if (!groupName) {
        AppToaster({
          position: Position.BOTTOM,
        }).show({
          message: '干员组名不能为空',
          intent: Intent.DANGER,
        })
      } else eventHandleProxy('add', { name: groupName.trim() })
    }
    return (
      <div className="flex px-3 items-center">
        <InputGroup
          type="text"
          value={groupName}
          placeholder="输入干员组名"
          onChange={(e) => setGroupName(e.target.value)}
          fill
        />
        <div className="flex items-center">
          <Button minimal icon="tick" title="添加" onClick={addGroupHandle} />
          <Button
            minimal
            icon="reset"
            title="重置"
            onClick={() => setGroupName('')}
          />
        </div>
      </div>
    )
  }
  return (
    <div className="flex px-1">
      <div className="flex-1 sticky top-0 h-screen overflow-y-auto">
        <SheetContainerSkeleton title="添加干员组" icon="add" mini>
          <EditorGroupName />
        </SheetContainerSkeleton>
        <SheetContainerSkeleton title="已设置的分组" icon="cog" mini>
          <div>
            {existedGroups.length
              ? existedGroups.map((item, index) => (
                  <GroupItem
                    key={index}
                    existedGroup={existedGroups}
                    existedOperator={existedOperators}
                    groupInfo={item}
                    editable
                    exist={checkGroupExisted(item.name)}
                    pinned={checkGroupPinned(item)}
                    eventHandleProxy={eventHandleProxy}
                  />
                ))
              : GroupNoData}
          </div>
        </SheetContainerSkeleton>
      </div>
      <Divider />
      <div className="flex-1">
        <SheetContainerSkeleton title="推荐分组" icon="thumbs-up" mini>
          <div>
            {defaultGroup.length
              ? defaultGroup.map((item, index) => (
                  <GroupItem
                    key={index}
                    groupInfo={item}
                    editable={false}
                    exist={checkGroupExisted(item.name)}
                    eventHandleProxy={eventHandleProxy}
                    pinned={checkGroupPinned(item)}
                  />
                ))
              : GroupNoData}
          </div>
        </SheetContainerSkeleton>
        <SheetContainerSkeleton title="收藏分组" icon="star" mini>
          <div>
            {favGroups.length
              ? favGroups.map((item, index) => (
                  <GroupItem
                    key={index}
                    groupInfo={item}
                    editable={false}
                    exist={checkGroupExisted(item.name)}
                    eventHandleProxy={eventHandleProxy}
                    pinned={checkGroupPinned(item)}
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

const GroupNoData = <NonIdealState title="暂无干员组" />
