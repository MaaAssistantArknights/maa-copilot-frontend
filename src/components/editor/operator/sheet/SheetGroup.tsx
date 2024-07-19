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
import { FC, useMemo, useState } from 'react'

import { AppToaster } from 'components/Toaster'
import { OPERATORS, PROFESSIONS } from 'models/operator'
import { favGroupAtom } from 'store/useFavGroups'

import { Group } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { GroupNoData } from './SheetNoneData'
import { useSheet } from './SheetProvider'
import { SheetGroupItem } from './sheetGroup/SheetGroupItem'

export interface SheetGroupProps {}

export interface GroupListModifyProp {
  groupAddHandle?: (value: Group) => void
  groupRemoveHandle?: (_id: string) => void
  groupPinHandle?: (value: Group) => void
  groupUpdateHandle?: (value: Group) => void
}

const EditorGroupName: FC = () => {
  const [groupName, setGroupName] = useState('')

  const { submitGroup } = useSheet()

  const addGroupHandle = () => {
    const name = groupName.trim()
    if (!name) {
      AppToaster.show({
        message: '干员组名不能为空',
        intent: Intent.DANGER,
      })
    } else {
      submitGroup({ name }, undefined, true)
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

const SheetGroup: FC<SheetGroupProps> = () => {
  const { existedGroups, existedOperators } = useSheet()

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

  const updateFavGroup = (value: Group) =>
    setFavGroups([
      ...[...favGroups].filter(({ name }) => name !== value.name),
      { ...value },
    ])

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
              <EditorGroupName />
            </SheetContainerSkeleton>
            <SheetContainerSkeleton title="已设置的干员组" icon="cog" mini>
              <div>
                {existedGroups.length ? (
                  <>
                    {existedGroups.map((item) => (
                      <SheetGroupItem groupInfo={item} itemType="selected" />
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
                    <SheetGroupItem groupInfo={item} itemType="recommend" />
                  ))
                : GroupNoData}
            </div>
          </SheetContainerSkeleton>
          <SheetContainerSkeleton title="收藏分组" icon="star" mini>
            <div>
              {favGroups.length
                ? favGroups.map((item) => (
                    <SheetGroupItem groupInfo={item} itemType="fav" />
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

export const SheetGroupContainer: FC<SheetGroupProps> = () => (
  <SheetContainerSkeleton title="设置干员组" icon="people">
    <SheetGroup />
  </SheetContainerSkeleton>
)
