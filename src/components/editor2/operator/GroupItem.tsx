import {
  Button,
  Card,
  Elevation,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { PrimitiveAtom, useAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { FC, memo, useEffect, useRef } from 'react'

import { Droppable, Sortable, useStableArray } from '../../dnd'
import { AtomRenderer } from '../AtomRenderer'
import { EditorGroup, editorAtoms, useEditorControls } from '../editor-state'
import { createOperator, getInternalId } from '../reconciliation'
import { OperatorItem } from './OperatorItem'
import { OperatorSelect } from './OperatorSelect'
import { useAddOperator } from './useAddOperator'

interface GroupItemProps {
  groupAtom: PrimitiveAtom<EditorGroup>
}

export const GroupItem: FC<GroupItemProps> = memo(({ groupAtom }) => {
  const [group, setGroup] = useImmerAtom(groupAtom)
  const [groupAtoms, dispatchGroups] = useAtom(editorAtoms.groupAtoms)
  const [operatorAtoms, dispatchOperators] = useAtom(
    editorAtoms.groupOperatorAtoms(getInternalId(group)),
  )
  const [{ activeGroupId, newlyAddedGroupId }, setUI] = useImmerAtom(
    editorAtoms.ui,
  )
  const { withCheckpoint } = useEditorControls()
  const addOperator = useAddOperator()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const actionContainerRef = useRef<HTMLDivElement>(null)
  const actionContainerInitialWidthRef = useRef(0)

  const operatorIds = useStableArray(group.opers.map(getInternalId))
  const isActive = getInternalId(group) === activeGroupId
  const id = getInternalId(group)

  useEffect(() => {
    if (newlyAddedGroupId === id) {
      titleInputRef.current?.focus()
      setUI((ui) => {
        ui.newlyAddedGroupId = undefined
      })
    }
  }, [newlyAddedGroupId, id, setUI])

  return (
    <Card
      elevation={Elevation.ONE}
      className={clsx(
        '!p-0 flex flex-col overflow-hidden',
        isActive ? 'ring ring-blue-500 !border-0 !shadow-none' : '',
      )}
    >
      <div className="flex">
        <InputGroup
          className="grow"
          inputClassName="!p-4 !pr-0 !border-0 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600 !shadow-none font-bold text-gray-800"
          size={10}
          placeholder="干员组名称"
          inputRef={titleInputRef}
          value={group.name}
          onChange={(e) => {
            withCheckpoint(() => {
              setGroup((draft) => {
                draft.name = e.target.value
              })
              return {
                action: 'set-group-name-' + getInternalId(group),
                desc: '修改干员组名称',
                squash: true,
              }
            })
          }}
        />
        <Popover2
          placement="bottom"
          content={
            <Menu>
              <MenuItem icon="star" text="添加到收藏夹（待实现）" disabled />
              <MenuItem
                icon="arrow-left"
                text="左移"
                disabled={groupAtoms.indexOf(groupAtom) === 0}
                onClick={() => {
                  withCheckpoint(() => {
                    dispatchGroups({
                      type: 'move',
                      atom: groupAtom,
                      before: groupAtoms[groupAtoms.indexOf(groupAtom) - 1],
                    })
                    return {
                      action: 'move-group',
                      desc: '移动干员组',
                      squash: false,
                    }
                  })
                }}
              />
              <MenuItem
                icon="arrow-right"
                text="右移"
                disabled={
                  groupAtoms.indexOf(groupAtom) === groupAtoms.length - 1
                }
                onClick={() => {
                  withCheckpoint(() => {
                    dispatchGroups({
                      type: 'move',
                      atom: groupAtom,
                      before: groupAtoms[groupAtoms.indexOf(groupAtom) + 2],
                    })
                    return {
                      action: 'move-group',
                      desc: '移动干员组',
                      squash: false,
                    }
                  })
                }}
              />
              <MenuItem
                icon="trash"
                text="删除"
                intent="danger"
                onClick={() => {
                  withCheckpoint(() => {
                    dispatchGroups({
                      type: 'remove',
                      atom: groupAtom,
                    })
                    return {
                      action: 'remove-group',
                      desc: '移除干员组',
                      squash: false,
                    }
                  })
                }}
              />
            </Menu>
          }
        >
          <Button
            minimal
            icon={<Icon icon="more" className="rotate-90" />}
            className="h-full !p-0 !border-0"
          />
        </Popover2>
      </div>
      <Droppable
        className="grow px-4 py-2"
        id={getInternalId(group)}
        data={{ type: 'group' }}
      >
        <SortableContext items={operatorIds}>
          <ul className="flex flex-wrap gap-4">
            {operatorAtoms.map((operatorAtom) => (
              <AtomRenderer
                atom={operatorAtom}
                key={operatorAtom.toString()}
                render={(operator, { onChange }) => (
                  <Sortable
                    id={getInternalId(operator)}
                    key={getInternalId(operator)}
                    data={{
                      type: 'operator',
                      container: getInternalId(group),
                    }}
                  >
                    {(attrs) => (
                      <OperatorItem
                        operator={operator}
                        onChange={onChange}
                        onRemove={() =>
                          withCheckpoint(() => {
                            dispatchOperators({
                              type: 'remove',
                              atom: operatorAtom,
                            })
                            return {
                              action: 'remove-operator',
                              desc: '移除干员',
                              squash: false,
                            }
                          })
                        }
                        {...attrs}
                      />
                    )}
                  </Sortable>
                )}
              />
            ))}
          </ul>
        </SortableContext>
        {group.opers.length === 0 && (
          <div className="relative min-h-36 flex flex-col items-center justify-center text-xs text-zinc-500">
            {isActive ? (
              '从列表中选择干员'
            ) : (
              <div className="absolute top-0 right-0 left-0">
                干员组表示可替换的干员，用户可使用其中的任意一位，如果让 MAA
                自动编队则会按最高练度来选择。
                <br />
                <br />
                你可以：
                <ul className="ml-4 list-[square]">
                  <li>点击快捷编辑</li>
                  <li>点击添加干员</li>
                  <li>拖动上方的干员到这里</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </Droppable>
      <div
        className={clsx(
          'flex',
          isActive
            ? '!bg-blue-500 hover:!bg-blue-600 dark:!bg-blue-900 !text-white'
            : '!bg-gray-200 dark:!bg-gray-600',
        )}
      >
        <div
          className={clsx('flex items-center', isActive && 'grow')}
          ref={actionContainerRef}
          style={{
            minWidth: isActive
              ? actionContainerInitialWidthRef.current
              : undefined,
          }}
        >
          <Button
            minimal
            icon={
              <Icon
                icon={isActive ? 'tick' : 'aimpoints-target'}
                className="!text-inherit"
              />
            }
            className={clsx(
              '!rounded-none !text-inherit',
              isActive && 'grow !justify-start',
            )}
            onClick={() => {
              // 进入编辑模式时会少一个按钮，所以要把宽度固定住，防止布局突然变化
              if (!isActive && actionContainerRef.current) {
                const rect = actionContainerRef.current.getBoundingClientRect()
                actionContainerInitialWidthRef.current = rect.width
              }
              setUI((ui) => {
                ui.activeGroupId = isActive ? undefined : getInternalId(group)
              })
            }}
          >
            {isActive ? '完成' : '快捷编辑'}
          </Button>
          {!isActive && (
            <OperatorSelect
              markPicked
              onSelect={(name) => {
                addOperator(createOperator({ name }), getInternalId(group))
              }}
            >
              <Button
                minimal
                className="!rounded-none !text-inherit"
                icon={<Icon icon="plus" />}
                text="添加干员..."
              />
            </OperatorSelect>
          )}
        </div>
      </div>
    </Card>
  )
})
GroupItem.displayName = 'GroupItem'
