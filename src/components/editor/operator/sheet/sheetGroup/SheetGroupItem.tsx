import {
  Alert,
  Button,
  Card,
  Collapse,
  Icon,
  Intent,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useMemo, useRef, useState } from 'react'
import { UseFormSetError, useForm } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { CopilotDocV1 } from 'models/copilot.schema'

import { Group } from '../../EditorSheet'
import { OperatorNoData } from '../SheetNoneData'
import { OperatorItem } from '../SheetOperatorItem'
import { EventType } from '../SheetOperatorSkillAbout'
import {
  CollapseButton,
  SheetGroupOperatorSelectProp,
  SheetGroupOperatorSelectTrigger,
} from './SheetGroupOperatorSelect'

interface GroupItemProps extends SheetGroupOperatorSelectProp {
  editable: boolean
  exist: boolean
  pinned: boolean
}

export const GroupItem = ({
  groupInfo,
  editable,
  exist,
  pinned,
  eventHandleProxy,
  ...rest
}: GroupItemProps) => {
  const [showOperators, setShowOperators] = useState(editable)

  const createOrDeleteGroup = () => {
    if (exist) {
      if (editable) eventHandleProxy('remove', groupInfo)
    } else eventHandleProxy('add', groupInfo)
  }
  const changeGroupedOperatorSkillHandle = (
    type: EventType,
    value: CopilotDocV1.Operator,
  ) => {
    if (type === 'skill') {
      // deep copy
      const groupInfoCopy = JSON.parse(JSON.stringify(groupInfo))
      groupInfoCopy.opers![
        groupInfoCopy.opers!.findIndex(({ name }) => name === value.name)
      ] = value
      eventHandleProxy('update', groupInfoCopy)
    }
  }
  const renameEventHandle = (
    name: string,
    errorHandle: UseFormSetError<Group>,
  ) => {
    eventHandleProxy('rename', { ...groupInfo, name }, errorHandle)
  }

  const OperatorsPart = useMemo(
    () => (
      <Collapse isOpen={showOperators}>
        <div className="w-full pt-1">
          {groupInfo.opers?.length
            ? groupInfo.opers?.map((item) => (
                <OperatorItem
                  key={item.name}
                  operator={item}
                  name={item.name}
                  selected
                  scaleDisable
                  interactive={false}
                  horizontal
                  submitOperator={changeGroupedOperatorSkillHandle}
                />
              ))
            : !editable && OperatorNoData}
          {editable && (
            <SheetGroupOperatorSelectTrigger
              groupInfo={groupInfo}
              eventHandleProxy={eventHandleProxy}
              {...rest}
            />
          )}
        </div>
      </Collapse>
    ),
    [showOperators, groupInfo.opers, rest],
  )
  const GroupName = useMemo(
    () => (
      <GroupTitle
        groupTitle={groupInfo.name}
        editable={editable}
        renameSubmit={renameEventHandle}
      />
    ),
    [groupInfo.name],
  )

  const GroupActions = useMemo(() => {
    const pinText = pinned ? `从收藏移除` : `添加至收藏`
    const pinIcon = pinned ? 'star' : 'star-empty'
    return (
      <div className="ml-auto flex items-center">
        <CollapseButton
          isCollapse={showOperators}
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
        {(editable || pinned) && (
          <Popover2
            disabled={!pinned}
            content={
              <Menu className="p-0">
                <MenuItem
                  text={pinText}
                  icon={pinIcon}
                  onClick={() => eventHandleProxy('pin', groupInfo)}
                />
              </Menu>
            }
          >
            <Button
              minimal
              icon={pinIcon}
              title={pinText}
              onClick={
                pinned ? undefined : () => eventHandleProxy('pin', groupInfo)
              }
            />
          </Popover2>
        )}
      </div>
    )
  }, [showOperators, pinned, exist, eventHandleProxy])

  return (
    <Card interactive={!exist} className="mt-1 mx-0.5">
      <div className="flex items-center">
        {GroupName}
        {GroupActions}
      </div>
      {OperatorsPart}
    </Card>
  )
}

const GroupTitle = ({
  groupTitle,
  editable,
  renameSubmit,
}: {
  editable: boolean
  renameSubmit: (newName: string, errorHandle: UseFormSetError<Group>) => void
  groupTitle: string
}) => {
  const [editName, setEditName] = useState('')
  const [nameEditState, setNameEditState] = useState(false)
  const [alertState, setAlertState] = useState(false)
  const { register, handleSubmit, setError, reset } = useForm<Group>()
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
  const NameIcon = useMemo(() => <Icon icon="people" />, [])
  const EditAlert = useMemo(
    () => (
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
    ),
    [alertState],
  )
  const NameInput = useMemo(
    () => (
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
    ),
    [groupTitle, editName],
  )
  const SubmitButton = useMemo(
    () => (
      <>
        {nameEditState && (
          <Button
            minimal
            icon="tick"
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
          />
        )}
      </>
    ),
    [nameEditState],
  )
  return (
    <>
      {EditAlert}
      <form
        className="flex items-center"
        onSubmit={handleSubmit(() => {
          ignoreBlur.current = true
          renameSubmit(editName || groupTitle, setError)
          setNameEditState(false)
          inputRef.current?.blur()
        })}
      >
        <div className="flex items-center w-full">
          {NameIcon}
          {NameInput}
          {SubmitButton}
        </div>
      </form>
    </>
  )
}
