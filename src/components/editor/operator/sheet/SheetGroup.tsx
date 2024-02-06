import {
  Alert,
  Button,
  Divider,
  H5,
  InputGroup,
  Intent,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { isEqual, omit } from 'lodash-es'
import { useMemo, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/operator'
import { favGroupAtom } from 'store/useFavGroups'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { Group } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { GroupNoData } from './SheetNoneData'
import { GroupItem } from './sheetGroup/SheetGroupItem'

export type EventType = 'add' | 'remove' | 'pin' | 'opers' | 'rename' | 'update'

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
  const [coverGroup, setCoverGroup] = useState<Group>()

  const defaultGroup = useMemo<Group[]>(() => {
    const result: CopilotDocV1.Group[] = []
    PROFESSIONS.forEach((proItem) => {
      proItem.sub?.forEach((subProItem) => {
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
    !!existedGroups.find((item) => item.name === target)
  const checkGroupPinned = (
    target: Group,
    ignoreKeyDic: string[] = ['_id', 'id'],
  ) => {
    const checkTarget = favGroups.find((item) => item.name === target.name)
    if (checkTarget) {
      if ((checkTarget.opers?.length || 0) === (target.opers?.length || 0)) {
        for (const aItem of checkTarget.opers!) {
          if (
            target.opers?.find((bItem) => {
              return isEqual(
                omit(aItem, ignoreKeyDic),
                omit(bItem, ignoreKeyDic),
              )
            })
          )
            continue
          else return false
        }
        return true
      } else return false
    } else return false
    // return isEqualWith(checkTarget, target, (value1, value2, key) => {
    //   if (ignoreKeyDic.find((item) => item === key)) return true
    //   else {
    //   }
    // })
  }
  const checkSamePinned = (target: string) =>
    !!favGroups.find(({ name }) => name === target)
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
  const updateFavGroup = (value: Group) =>
    setFavGroups([
      ...[...favGroups].filter(({ name }) => name !== value.name),
      { ...value },
    ])
  const eventHandleProxy = (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<Group>,
  ) => {
    const errHandle = setError || function () {}
    switch (type) {
      case 'add': {
        if (checkGroupExisted(value.name)) {
          AppToaster.show({
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
          if (checkSamePinned(value.name)) setCoverGroup(value)
          else updateFavGroup(value)
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

  const FavCoverAlert = useMemo(
    () => (
      <Alert
        isOpen={!!coverGroup}
        confirmButtonText="是"
        cancelButtonText="否"
        icon="error"
        intent={Intent.DANGER}
        onConfirm={() => updateFavGroup(coverGroup as Group)}
        onClose={() => setCoverGroup(undefined)}
      >
        <div>
          <H5>收藏干员组: </H5>
          <p>检测到同名的已收藏干员组 {coverGroup?.name}，是否覆盖？</p>
        </div>
      </Alert>
    ),
    [coverGroup?.name],
  )

  return (
    <>
      {FavCoverAlert}
      <div className="flex px-1">
        <div className="flex-1 sticky top-0 h-screen overflow-y-auto">
          <SheetContainerSkeleton title="添加干员组" icon="add" mini>
            <EditorGroupName {...{ eventHandleProxy }} />
          </SheetContainerSkeleton>
          <SheetContainerSkeleton title="已设置的分组" icon="cog" mini>
            <div>
              {existedGroups.length
                ? existedGroups.map((item) => (
                    <GroupItem
                      key={item.name}
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
                ? defaultGroup.map((item) => (
                    <GroupItem
                      key={item.name}
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
                ? favGroups.map((item) => (
                    <GroupItem
                      key={item.name}
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
    </>
  )
}

const EditorGroupName = ({
  eventHandleProxy,
}: {
  eventHandleProxy: (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<Group> | undefined,
  ) => void
}) => {
  const [groupName, setGroupName] = useState('')

  const addGroupHandle = () => {
    if (!groupName) {
      AppToaster.show({
        message: '干员组名不能为空',
        intent: Intent.DANGER,
      })
    } else {
      eventHandleProxy('add', { name: groupName.trim() })
      setGroupName('')
    }
  }

  const InputPart = useMemo(
    () => (
      <InputGroup
        type="text"
        value={groupName}
        placeholder="输入干员组名"
        onChange={(e) => setGroupName(e.target.value)}
        fill
      />
    ),
    [groupName],
  )
  const OperationButton = useMemo(
    () => (
      <div className="flex items-center">
        <Button minimal icon="tick" title="添加" onClick={addGroupHandle} />
        <Button
          minimal
          icon="reset"
          title="重置"
          onClick={() => setGroupName('')}
        />
      </div>
    ),
    [addGroupHandle],
  )

  return (
    <div className="flex px-3 items-center">
      {InputPart}
      {OperationButton}
    </div>
  )
}

export const SheetGroupContainer = (sheetGroupProps: SheetGroupProps) => (
  <SheetContainerSkeleton title="设置干员组" icon="people">
    <SheetGroup {...sheetGroupProps} />
  </SheetContainerSkeleton>
)
