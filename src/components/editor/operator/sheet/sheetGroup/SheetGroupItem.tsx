import {
  Alert,
  Button,
  Card,
  Collapse,
  Icon,
  IconName,
  Intent,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useAtom } from 'jotai'
import { cloneDeep, isEqual, omit } from 'lodash-es'
import { FC, ReactNode, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { favGroupAtom, ignoreKeyDic } from 'store/useFavGroups'

import { Group, Operator } from '../../EditorSheet'
import { GroupListModifyProp } from '../SheetGroup'
import { OperatorNoData } from '../SheetNoneData'
import { useSheet } from '../SheetProvider'
import {
  OperatorInGroupItem,
  OperatorInGroupItemProp,
} from './OperatorInGroupItem'
import {
  CollapseButton,
  SheetGroupOperatorSelectProp,
  SheetGroupOperatorSelectTrigger,
} from './SheetGroupOperatorSelect'
import { SheetOperatorEditor } from './SheetOperatorEditor'

export interface GroupItemProps
  extends SheetGroupOperatorSelectProp,
    GroupListModifyProp {
  exist: boolean
  pinned: boolean
}

export const GroupItem = ({
  groupInfo,
  exist,
  pinned,
  groupAddHandle,
  groupRemoveHandle,
  groupPinHandle,
  groupUpdateHandle,
  ...rest
}: GroupItemProps) => {
  const editable = typeof groupRemoveHandle === 'function'
  const [showOperators, setShowOperators] = useState(editable)

  const renameEventHandle = (name: string) =>
    groupUpdateHandle?.({ ...groupInfo, name })

  const changeGroupedOperatorSkillHandle = (value: Operator) => {
    // deep copy
    const groupInfoCopy = JSON.parse(JSON.stringify(groupInfo))
    groupInfoCopy.opers![
      groupInfoCopy.opers!.findIndex(({ name }) => name === value.name)
    ] = value
    groupUpdateHandle?.(groupInfoCopy)
  }

  const OperatorsPart = (
    <Collapse isOpen={showOperators}>
      <div className="w-full pt-1">
        {groupInfo.opers?.length
          ? groupInfo.opers?.map((item) => (
              <OperatorInGroupItem
                key={item.name}
                operatorInfo={item}
                onOperatorSkillChange={changeGroupedOperatorSkillHandle}
              />
            ))
          : !editable && OperatorNoData}
        {editable && (
          <SheetGroupOperatorSelectTrigger
            groupInfo={groupInfo}
            groupUpdateHandle={groupUpdateHandle}
            {...rest}
          />
        )}
      </div>
    </Collapse>
  )

  const pinText = pinned ? `从收藏分组中移除` : `添加至收藏分组`
  const pinIcon: IconName = pinned ? 'star' : 'star-empty'

  return (
    <Card interactive={!exist} className="mt-1 mx-0.5">
      <div className="flex items-center">
        <GroupTitle
          groupTitle={groupInfo.name}
          editable={editable}
          renameSubmit={renameEventHandle}
        />
        <div className="ml-auto flex items-center">
          <CollapseButton
            isCollapse={showOperators}
            onClick={() => setShowOperators(!showOperators)}
          />
          {editable ? (
            <CardDeleteOption
              className="cursor-pointer"
              onClick={() => groupRemoveHandle?.(groupInfo._id || '')}
            />
          ) : (
            <Button
              minimal
              icon={exist ? 'tick' : 'arrow-left'}
              title={exist ? '已选择' : '使用该推荐分组'}
              onClick={() => groupAddHandle?.(groupInfo)}
            />
          )}
          {(editable || pinned) && (
            <Popover2
              disabled={!pinned}
              content={
                <Menu className="p-0">
                  <MenuItem
                    text={pinText}
                    icon={pinIcon}
                    onClick={() => groupPinHandle?.(groupInfo)}
                  />
                </Menu>
              }
            >
              <Button
                minimal
                icon={pinIcon}
                title={pinText}
                onClick={pinned ? undefined : () => groupPinHandle?.(groupInfo)}
              />
            </Popover2>
          )}
        </div>
      </div>
      {OperatorsPart}
    </Card>
  )
}

const GroupTitle = ({
  groupTitle,
  // editable,
  renameSubmit,
}: {
  editable: boolean
  renameSubmit?: (newName: string) => void
  groupTitle: string
}) => {
  const editable = !!renameSubmit
  const [editName, setEditName] = useState('')
  const [nameEditState, setNameEditState] = useState(false)
  const [alertState, setAlertState] = useState(false)
  const { register, handleSubmit, reset } = useForm<Group>()
  // handle differ priority of capture events
  const ignoreBlur = useRef(false)
  const blurHandle = () => {
    if (!ignoreBlur.current) {
      if (groupTitle !== editName && editName) setAlertState(true)
      setNameEditState(false)
    } else ignoreBlur.current = false
  }
  const editCancel = () => {
    setNameEditState(false)
    setEditName(groupTitle)
    reset()
    setAlertState(false)
  }
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...registerRest } = register('name', {
    onBlur: blurHandle,
    value: editName,
    onChange: (e) => setEditName(e.target.value),
  })
  const editContinue = () => {
    setNameEditState(true)
    setAlertState(false)
    inputRef.current?.focus()
  }

  return (
    <>
      <Alert
        onConfirm={editContinue}
        intent={Intent.DANGER}
        onCancel={editCancel}
        confirmButtonText="取消"
        cancelButtonText="确认"
        isOpen={alertState}
      >
        <p>当前干员组名修改未保存，是否放弃修改？</p>
      </Alert>
      <form
        className="flex items-center"
        onSubmit={handleSubmit(() => {
          ignoreBlur.current = true
          renameSubmit?.(editName || groupTitle)
          setNameEditState(false)
          inputRef.current?.blur()
        })}
      >
        <div className="flex items-center w-full">
          <Icon icon="people" />
          <input
            title="修改干员组名称"
            className={clsx(
              'ml-1 w-full bg-transparent text-xs',
              !editable && 'placeholder:text-current',
            )}
            autoComplete="off"
            disabled={!editable}
            onFocus={() => setNameEditState(true)}
            placeholder={groupTitle}
            type="text"
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === 'enter') e.preventDefault()
            }}
            {...registerRest}
          />
          {nameEditState && (
            <Button
              minimal
              icon="tick"
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
            />
          )}
        </div>
      </form>
    </>
  )
}

type ItemType = 'recommend' | 'selected' | 'fav'

export interface SheetGroupItemProp {
  groupInfo: Group
  itemType: ItemType
}

export const SheetGroupItem: FC<SheetGroupItemProp> = ({
  groupInfo,
  itemType,
}) => {
  const {
    selected,
    onGroupNameChange,
    defaultOperatorCollapseOpen,
    ActionList,
    onOperatorSkillChange,
  } = useSheetGroupItemController({
    groupInfo,
    itemType,
  })
  const [operatorCollapse, setOperatorCollapse] = useState(
    defaultOperatorCollapseOpen,
  )

  return (
    <Card interactive={!selected} className="mt-1 mx-0.5">
      <div className="flex items-center justify-between">
        <GroupTitle
          groupTitle={groupInfo.name}
          editable
          renameSubmit={onGroupNameChange}
        />
        <div className="flex items-center">
          <CollapseButton
            isCollapse={operatorCollapse}
            onClick={() => setOperatorCollapse((prev) => !prev)}
          />
          {ActionList}
        </div>
      </div>
      <Collapse isOpen={operatorCollapse}>
        <div className="w-full pt-1">
          {groupInfo.opers?.length
            ? groupInfo.opers?.map((item) => (
                <OperatorInGroupItem
                  operatorInfo={item}
                  onOperatorSkillChange={onOperatorSkillChange}
                />
              ))
            : OperatorNoData}
          {selected && <SheetOperatorEditor {...groupInfo} />}
        </div>
      </Collapse>
    </Card>
  )
}

type SheetGroupItemController = {
  selected: boolean
  onGroupNameChange: ((name: string) => void) | undefined
  defaultOperatorCollapseOpen: boolean
  onOperatorSkillChange: OperatorInGroupItemProp['onOperatorSkillChange']
  ActionList: ReactNode
}

const useSheetGroupItemController = ({
  groupInfo: { name, opers = [], ...rest },
  itemType,
}: SheetGroupItemProp): SheetGroupItemController => {
  const { submitGroup, removeGroup, existedGroups } = useSheet()
  const [favGroup, setFavGroup] = useAtom(favGroupAtom)

  switch (itemType) {
    case 'selected': {
      const findFavByName = favGroup.find(
        ({ name: nameInFav }) => nameInFav === name,
      )
      const pinned = isEqual({ name, opers }, findFavByName)

      const onPinChange: GroupPinOptionProp['onPinChange'] = () => {
        const newFavGroup = [
          ...favGroup.filter(({ name: nameInFav }) => nameInFav !== name),
        ]
        setFavGroup(
          pinned
            ? newFavGroup
            : [...newFavGroup, cloneDeep({ name, opers, ...rest })],
        )
      }
      return {
        selected: true,
        onGroupNameChange: (name: string) =>
          submitGroup({ opers, ...rest, name }, undefined, true),
        defaultOperatorCollapseOpen: true,
        onOperatorSkillChange: (operator: Operator) => {
          opers.splice(
            opers.findIndex(
              ({ name: nameInExist }) => nameInExist === operator.name,
            ),
            1,
            operator,
          )
          submitGroup({ opers, name, ...rest }, undefined, true)
        },
        ActionList: (
          <>
            <CardDeleteOption
              onClick={() =>
                removeGroup(
                  existedGroups.findIndex(
                    ({ name: nameInExist }) => nameInExist === name,
                  ),
                )
              }
            />
            <GroupPinOption
              pinned={pinned}
              onPinChange={onPinChange}
              isDuplicate={!!findFavByName}
            />
          </>
        ),
      }
    }
    case 'recommend': {
      return {
        selected: false,
        onGroupNameChange: undefined,
        defaultOperatorCollapseOpen: false,
        onOperatorSkillChange: undefined,
        ActionList: (
          <>
            <Button
              minimal
              icon="arrow-left"
              title="添加干员组"
              onClick={() => submitGroup({ name, opers }, undefined, true)}
            />
          </>
        ),
      }
    }
    case 'fav': {
      const selected = existedGroups.find(
        ({ name: nameInExist }) => nameInExist === name,
      )
      const equal = selected
        ? isEqual(omit(selected, ...ignoreKeyDic), { name, opers })
        : false
      const onPinChange: GroupPinOptionProp['onPinChange'] = () => {
        setFavGroup(
          favGroup.filter(({ name: nameInFav }) => nameInFav !== name),
        )
      }

      return {
        selected: false,
        onGroupNameChange: (name: string) =>
          setFavGroup([
            ...favGroup.filter(({ name: favName }) => favName !== name),
            { opers, name, ...rest },
          ]),
        defaultOperatorCollapseOpen: false,
        onOperatorSkillChange: (operator: Operator) => {
          opers.splice(
            opers.findIndex(
              ({ name: nameInExist }) => nameInExist === operator.name,
            ),
            1,
            operator,
          )
          favGroup.splice(
            favGroup.findIndex(
              ({ name: nameInFav }) => nameInFav === operator.name,
            ),
            1,
            { name, opers, ...rest },
          )
          setFavGroup(favGroup)
        },
        ActionList: (
          <>
            <Button
              minimal
              disabled={!!selected}
              icon={selected && equal ? 'tick' : 'arrow-left'}
              title={
                selected
                  ? equal
                    ? '已添加'
                    : '检测到同名干员组'
                  : '使用该推荐分组'
              }
              onClick={() => submitGroup({ name, opers }, undefined, true)}
            />
            <GroupPinOption pinned onPinChange={onPinChange} />
          </>
        ),
      }
    }
    default:
      return {
        selected: false,
        onGroupNameChange: undefined,
        defaultOperatorCollapseOpen: false,
        onOperatorSkillChange: undefined,
        ActionList: <></>,
      }
  }
}

interface GroupPinOptionProp {
  pinned: boolean
  onPinChange?: () => void
  isDuplicate?: boolean
}

const GroupPinOption: FC<GroupPinOptionProp> = ({
  pinned,
  onPinChange,
  isDuplicate = false,
}) => {
  const pinText = pinned
    ? `从收藏分组中移除`
    : isDuplicate
      ? '此操作会替换同名干员组'
      : `添加至收藏分组`

  return (
    <Popover2
      disabled={!pinned && !isDuplicate}
      content={
        <Menu className="p-0">
          <MenuItem
            text={pinText}
            icon={pinned ? 'star' : isDuplicate ? 'warning-sign' : 'star-empty'}
            onClick={onPinChange}
          />
        </Menu>
      }
    >
      <Button
        minimal
        icon={pinned ? 'star' : 'star-empty'}
        title={pinText}
        onClick={pinned || isDuplicate ? undefined : onPinChange}
      />
    </Popover2>
  )
}
