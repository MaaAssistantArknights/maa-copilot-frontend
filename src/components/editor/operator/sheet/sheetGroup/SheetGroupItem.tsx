import {
  Alert,
  Button,
  Card,
  Collapse,
  H6,
  Icon,
  Intent,
} from '@blueprintjs/core'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'
import { OPERATORS } from 'models/generated/operators'

import { OperatorItem } from '../SheetOperatorItem'
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
            <SheetGroupOperatorSelectTrigger
              groupInfo={groupInfo}
              eventHandleProxy={eventHandleProxy}
              {...rest}
            />
          </div>
        )}
      </div>
    ),
    [groupInfo.opers, rest],
  )

  const GroupTitle = () => {
    const [editName, setEditName] = useState(groupInfo.name)
    const [nameEditState, setNameEditState] = useState(false)
    const [alertState, setAlertState] = useState(false)
    const { register, handleSubmit, setError, reset } = useForm<Group>()
    const switchState = (target?: boolean) => {
      if (!editable) return
      setNameEditState(target || !nameEditState)
    }
    const blurHandle = () => {
      if (groupInfo.name !== editName) setAlertState(true)
      setNameEditState(false)
    }
    const editCancel = () => {
      setNameEditState(false)
      setEditName(groupInfo.name)
      reset()
      setAlertState(false)
    }
    return (
      <>
        <Alert
          onConfirm={() => setAlertState(false)}
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
            eventHandleProxy(
              'rename',
              { ...groupInfo, name: editName },
              setError,
            )
          })}
        >
          <Icon icon="people" />
          {nameEditState ? (
            <div className="flex items-center">
              <input
                className="ml-1 w-16"
                autoComplete="off"
                type="text"
                {...register('name', {
                  required: '请设置干员组名字',
                  onBlur: blurHandle,
                  value: editName,
                  onChange: (e) => setEditName(e.target.value),
                })}
              />
              <Button
                minimal
                icon="tick"
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
          ) : (
            <H6
              className="ml-1 m-0 p-0"
              onClick={() => switchState(true)}
              title="修改干员组名"
            >
              {editName}
            </H6>
          )}
        </form>
      </>
    )
  }

  return (
    <Card interactive className="mt-1">
      <div className="flex items-center">
        <GroupTitle />
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
