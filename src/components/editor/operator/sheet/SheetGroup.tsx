import {
  Alert,
  Button,
  Divider,
  H5,
  H6,
  InputGroup,
  Intent,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { isEqual, isEqualWith, omit } from 'lodash-es'
import { FC, useMemo, useState } from 'react'
import { UseFieldArrayRemove } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { OPERATORS, PROFESSIONS } from 'models/operator'
import { favGroupAtom, ignoreKeyDic } from 'store/useFavGroups'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { Group, Operator } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { GroupNoData } from './SheetNoneData'
import { GroupItem } from './sheetGroup/SheetGroupItem'

export interface SheetGroupProps {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Group[]
  existedOperators: Operator[]
  removeGroup: UseFieldArrayRemove
}

export interface GroupListModifyProp {
  groupAddHandle?: (value: Group) => void
  groupRemoveHandle?: (_id: string) => void
  groupPinHandle?: (value: Group) => void
  groupUpdateHandle?: (value: Group) => void
}

const EditorGroupName = ({
  groupAddHandle,
}: {
  groupAddHandle: GroupListModifyProp['groupAddHandle']
}) => {
  const [groupName, setGroupName] = useState('')

  const addGroupHandle = () => {
    const name = groupName.trim()
    if (!name) {
      AppToaster.show({
        message: '干员组名不能为空',
        intent: Intent.DANGER,
      })
    } else {
      groupAddHandle?.({ name })
      setGroupName('')
    }
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

const SheetGroup = ({
  submitGroup,
  existedGroups,
  existedOperators,
  removeGroup,
}: SheetGroupProps) => {
  const [coverGroup, setCoverGroup] = useState<Group>()

  const defaultGroup = useMemo<Group[]>(() => {
    const result: Group[] = []
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
  }, [existedOperators, existedGroups])

  const checkGroupExisted = (target: string) =>
    !!existedGroups.find((item) => item.name === target)
  const checkGroupPinned = (target: Group, ignoreKey?: string[]) => {
    const checkTarget = favGroups.find((item) => item.name === target.name)
    if (checkTarget) {
      return isEqualWith(
        checkTarget,
        omit(target, [...(ignoreKey || ignoreKeyDic)]),
        ({ opers: aOpers }, { opers: bOpers }) =>
          isEqual(
            aOpers.map((item) => omit(item, [...(ignoreKey || ignoreKeyDic)])),
            bOpers.map((item) => omit(item, [...(ignoreKey || ignoreKeyDic)])),
          ),
      )
    } else {
      return false
    }
  }
  const checkSamePinned = (target: string) =>
    !!favGroups.find(({ name }) => name === target)
  const changeOperatorOfOtherGroups = (target: Operator[] | undefined) => {
    target?.forEach((item) => {
      existedGroups.forEach((groupItem) => {
        const oldLength = groupItem.opers?.length || 0
        if (oldLength) {
          const opers = groupItem.opers?.filter(
            (operItem) => operItem.name !== item.name,
          )
          if (opers?.length !== oldLength)
            submitGroup({ ...groupItem, ...{ opers } }, undefined, true)
        }
      })
    })
  }
  const updateFavGroup = (value: Group) =>
    setFavGroups([
      ...[...favGroups].filter(({ name }) => name !== value.name),
      { ...value },
    ])

  const groupAddHandle = (value: Group) => {
    if (checkGroupExisted(value.name)) {
      AppToaster.show({
        message: '干员组已存在！',
        intent: Intent.DANGER,
      })
    } else {
      if (checkGroupPinned(value)) changeOperatorOfOtherGroups(value.opers)
      submitGroup(value, undefined, true)
    }
  }
  const groupRemoveHandle = (_id: string) => {
    removeGroup(existedGroups.findIndex((item) => item._id === _id))
  }
  const groupPinHandle = (value: Group) => {
    if (checkGroupPinned(value))
      setFavGroups([...favGroups].filter(({ name }) => name !== value.name))
    else {
      if (checkSamePinned(value.name)) setCoverGroup(value)
      else updateFavGroup(value)
    }
  }
  const groupUpdateHandle = (value: Group) => {
    changeOperatorOfOtherGroups(value.opers)
    submitGroup(value, undefined, true)
  }

  const [favGroups, setFavGroups] = useAtom(favGroupAtom)

  return (
    <>
      <div className="flex px-1">
        <div className="flex-1 sticky top-0 h-screen flex flex-col">
          <div className="grow overflow-y-auto">
            <SheetContainerSkeleton
              title="添加干员组"
              icon="add"
              mini
              className="sticky top-0 z-10 backdrop-blur-lg py-1"
            >
              <EditorGroupName {...{ groupAddHandle }} />
            </SheetContainerSkeleton>
            <SheetContainerSkeleton title="已设置的干员组" icon="cog" mini>
              <div>
                {existedGroups.length ? (
                  <>
                    {existedGroups.map((item) => (
                      <GroupItem
                        key={item.name}
                        existedGroup={existedGroups}
                        existedOperator={existedOperators}
                        groupInfo={item}
                        exist={checkGroupExisted(item.name)}
                        pinned={checkGroupPinned(item)}
                        groupRemoveHandle={groupRemoveHandle}
                        groupPinHandle={groupPinHandle}
                        groupUpdateHandle={groupUpdateHandle}
                      />
                    ))}
                    <H6 className="my-2 text-center">
                      已显示全部 {existedGroups.length} 个干员组
                    </H6>
                  </>
                ) : (
                  GroupNoData
                )}
              </div>
            </SheetContainerSkeleton>
          </div>
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
                      exist={checkGroupExisted(item.name)}
                      groupAddHandle={groupAddHandle}
                      pinned={false}
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
                      exist={checkGroupExisted(item.name)}
                      groupAddHandle={groupAddHandle}
                      groupPinHandle={groupPinHandle}
                      pinned
                    />
                  ))
                : GroupNoData}
            </div>
          </SheetContainerSkeleton>
        </div>
      </div>
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
    </>
  )
}

export const SheetGroupContainer: FC<SheetGroupProps> = (sheetGroupProps) => (
  <SheetContainerSkeleton title="设置干员组" icon="people">
    <SheetGroup {...sheetGroupProps} />
  </SheetContainerSkeleton>
)
