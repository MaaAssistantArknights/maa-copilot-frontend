import { Alert, Button, Card, Collapse, Icon, Intent } from '@blueprintjs/core'

import { useMemo, useRef, useState } from 'react'
import { UseFormSetError, useForm } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS } from 'models/generated/operators'

import { OperatorItem } from '../SheetOperatorItem'
import { EventType } from '../SheetOperatorSkillAbout'
import {
  CollapseButton,
  Group,
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

  const Operators = useMemo(
    () => (
      <div className="w-full pt-1">
        {groupInfo.opers?.map((item) => (
          <OperatorItem
            id={
              OPERATORS.find((opInfoitem) => opInfoitem.name === item.name)
                ?.id || ''
            }
            operator={item}
            name={item.name}
            selected={false}
            interactive={false}
            horizontal
            submitOperator={changeGroupedOperatorSkillHandle}
          />
        ))}
        {editable && (
          <SheetGroupOperatorSelectTrigger
            groupInfo={groupInfo}
            eventHandleProxy={eventHandleProxy}
            {...rest}
          />
        )}
      </div>
    ),
    [groupInfo.opers, rest],
  )

  return (
    <Card interactive className="mt-1 mx-0.5">
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

const GroupTitle = ({
  groupTitle,
  editable,
  renameSubmit,
}: {
  editable: boolean
  renameSubmit: (newName: string, errorHandle: UseFormSetError<Group>) => void
  groupTitle: string
}) => {
  const [editName, setEditName] = useState(groupTitle)
  const [nameEditState, setNameEditState] = useState(false)
  const [alertState, setAlertState] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Group>()
  const ignoreBlur = useRef(false)
  const blurHandle = () => {
    if (!ignoreBlur.current) {
      if (groupTitle !== editName) setAlertState(true)
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
    required: true,
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
        className="ml-1 w-full bg-transparent text-xs"
        autoComplete="off"
        disabled={!editable}
        onFocus={() => setNameEditState(true)}
        placeholder={errors.name ? '干员组名不能为空' : ''}
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
    [groupTitle, editName, errors],
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
          renameSubmit(editName, setError)
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
