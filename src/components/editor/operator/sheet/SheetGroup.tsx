import { Divider, NonIdealState } from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/generated/operators'
import { favGroupAtom } from 'store/useFavGroups'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { EventType, Group, GroupItem } from './sheetGroup/SheetGroupItem'

type Operators = CopilotDocV1.Operator[]

export interface SheetGroupProps {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Group[]
  existedOperators: Operators
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
      if (checkTarget.opers?.length === target.opers?.length) {
        for (const aItem of checkTarget.opers!) {
          if (target.opers!.find((bItem) => bItem.name === aItem.name)) continue
          else return false
        }
        return true
      } else
        return (checkTarget.opers?.length || 0) === (target.opers?.length || 0)
    } else return false
  }
  const eventHandleProxy = (
    type: EventType,
    value: Group,
    setError?: UseFormSetError<Group>,
  ) => {
    const errHandle = setError || function () {}
    switch (type) {
      case 'add': {
        if (checkGroupPinned(value)) {
          value.opers?.forEach((item) => {
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
        submitGroup(value, errHandle)
        break
      }
      case 'remove': {
        removeGroup(existedGroups.findIndex((item) => item._id === value._id))
        break
      }
      case 'pin': {
        if (checkGroupPinned(value))
          setFavGroups([...favGroups].filter(({ name }) => name !== value.name))
        else setFavGroups([...favGroups, value])
        break
      }
      case 'rename': {
        submitGroup(value, errHandle, true)
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
                    pinned={checkGroupPinned(item)}
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
