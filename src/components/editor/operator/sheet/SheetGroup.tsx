import { Button, Divider, H6, InputGroup, Intent } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { FC, useMemo, useState } from 'react'

import { AppToaster } from 'components/Toaster'
import { OPERATORS, PROFESSIONS } from 'models/operator'
import { favGroupAtom } from 'store/useFavGroups'

import { Group, Operator } from '../EditorSheet'
import {
  SheetContainerSkeleton,
  SheetContainerSkeletonProps,
} from './SheetContainerSkeleton'
import { GroupNoData } from './SheetNoneData'
import { useSheet } from './SheetProvider'
import { SheetGroupItem, SheetGroupItemProp } from './sheetGroup/SheetGroupItem'

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

  const defaultGroup = useMemo<Group[]>(
    () =>
      Object.entries(
        existedOperators.reduce(
          (acc, { name, ...rest }) => {
            const { prof = '', subProf = '' } =
              OPERATORS.find(({ name: OPERName }) => OPERName === name) || {}
            const profInfo = PROFESSIONS.find(({ id }) => id === prof)
            const subProfName = profInfo?.sub?.find(
              ({ id }) => id === subProf,
            )?.name
            const key = (profInfo?.name || '其它') + '-' + (subProfName || '')
            if (!acc[key]) acc[key] = []
            acc[key].push({ name, ...rest })
            return acc
          },
          {} as Record<string, Operator[]>,
        ),
      ).map(([key, value]) => ({
        name: key,
        opers: value,
      })),
    [existedOperators],
  )

  const favGroups = useAtomValue(favGroupAtom)

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
            <SheetGroupItemsWithSkeleton
              title="已设置的干员组"
              icon="cog"
              mini
              groups={existedGroups}
              itemType="selected"
            />
            {!!existedGroups.length && (
              <H6 className="my-2 text-center">
                已显示全部 {existedGroups.length} 个干员组
              </H6>
            )}
          </div>
        </div>
        <Divider />
        <div className="flex-1">
          <SheetGroupItemsWithSkeleton
            title="推荐分组"
            icon="thumbs-up"
            mini
            groups={defaultGroup}
            itemType="recommend"
          />
          <SheetGroupItemsWithSkeleton
            title="收藏分组"
            icon="star"
            mini
            groups={favGroups}
            itemType="fav"
          />
        </div>
      </div>
    </>
  )
}

export const SheetGroupContainer: FC<SheetGroupProps> = () => (
  <SheetContainerSkeleton title="设置干员组" icon="people">
    <SheetGroup />
  </SheetContainerSkeleton>
)

const SheetGroupItemsWithSkeleton: FC<
  SheetContainerSkeletonProps & {
    groups: SheetGroupItemProp['groupInfo'][]
    itemType: SheetGroupItemProp['itemType']
  }
> = ({ groups, itemType, ...sheetContainerSkeletonProps }) => (
  <SheetContainerSkeleton {...sheetContainerSkeletonProps}>
    <div>
      {groups.length
        ? groups.map((item) => (
            <SheetGroupItem groupInfo={item} itemType={itemType} />
          ))
        : GroupNoData}
    </div>
  </SheetContainerSkeleton>
)
