import {
  Button,
  Callout,
  Card,
  Classes,
  Dialog,
  Elevation,
  Icon,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { PrimitiveAtom, useAtom, useAtomValue } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { FavGroup } from '../../../store/useFavGroups'
import { useDebouncedQuery } from '../../../utils/useDebouncedQuery'
import { Suggest } from '../../Suggest'
import { AppToaster } from '../../Toaster'
import { Droppable, Sortable } from '../../dnd'
import { AtomRenderer } from '../AtomRenderer'
import {
  BaseEditorGroup,
  editorAtoms,
  useActiveState,
  useEdit,
} from '../editor-state'
import { WithId, createOperator, editorFavGroupsAtom } from '../reconciliation'
import { useEntityErrors } from '../validation/validation'
import { OperatorItem } from './OperatorItem'
import { OperatorSelect } from './OperatorSelect'
import { useAddOperator } from './useAddOperator'

interface GroupItemProps {
  baseGroupAtom: PrimitiveAtom<BaseEditorGroup>
}

export const GroupItem: FC<GroupItemProps> = memo(({ baseGroupAtom }) => {
  const edit = useEdit()
  const baseGroup = useAtomValue(baseGroupAtom)
  const [baseGroupAtoms, dispatchBaseGroups] = useAtom(
    editorAtoms.baseGroupAtoms,
  )
  const [operatorAtoms, dispatchOperators] = useAtom(baseGroup.operAtomsAtom)
  const operatorIdsAtom = useMemo(() => {
    return selectAtom(
      baseGroup.opersAtom,
      (opers) => opers.map((o) => o.id),
      (a, b) => a.join() === b.join(),
    )
  }, [baseGroup.opersAtom])
  const [active, setActive] = useActiveState(
    editorAtoms.activeGroupIdAtom,
    baseGroup.id,
  )
  const operatorIds = useAtomValue(operatorIdsAtom)
  const errors = useEntityErrors(baseGroup.id)
  const addOperator = useAddOperator()

  const actionContainerRef = useRef<HTMLDivElement>(null)
  const actionContainerInitialWidthRef = useRef(0)

  const addToFavorite = useAtomCallback(
    useCallback(
      (get, set) => {
        const baseGroupAtoms = get(editorAtoms.baseGroupAtoms)
        const index = baseGroupAtoms.indexOf(baseGroupAtom)
        const group = get(editorAtoms.groups)[index]
        if (!group) {
          return
        }
        set(editorFavGroupsAtom, (prev) => [...prev, group])
        AppToaster.show({
          message: '已添加到收藏',
          intent: 'success',
        })
      },
      [baseGroupAtom],
    ),
  )

  return (
    <Card
      elevation={Elevation.ONE}
      className={clsx(
        '!p-0 flex flex-col overflow-hidden',
        active ? 'ring ring-purple-500 !border-0 !shadow-none' : '',
      )}
    >
      <div className="flex">
        <GroupTitle baseGroupAtom={baseGroupAtom} />
        <Popover2
          placement="bottom"
          content={
            <Menu>
              <MenuItem icon="star" text="添加到收藏" onClick={addToFavorite} />
              <MenuItem
                icon="arrow-left"
                text="左移"
                disabled={baseGroupAtoms.indexOf(baseGroupAtom) === 0}
                onClick={() => {
                  edit(() => {
                    dispatchBaseGroups({
                      type: 'move',
                      atom: baseGroupAtom,
                      before:
                        baseGroupAtoms[
                          baseGroupAtoms.indexOf(baseGroupAtom) - 1
                        ],
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
                  baseGroupAtoms.indexOf(baseGroupAtom) ===
                  baseGroupAtoms.length - 1
                }
                onClick={() => {
                  edit(() => {
                    dispatchBaseGroups({
                      type: 'move',
                      atom: baseGroupAtom,
                      before:
                        baseGroupAtoms[
                          baseGroupAtoms.indexOf(baseGroupAtom) + 2
                        ],
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
                  edit(() => {
                    dispatchBaseGroups({
                      type: 'remove',
                      atom: baseGroupAtom,
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
      {errors && (
        <Callout
          icon={null}
          intent="danger"
          className="!p-2 !rounded-none text-xs"
        >
          {errors.map(({ path, message, fieldLabel }) => (
            <p key={path.join()}>
              {fieldLabel && fieldLabel + ': '}
              {message}
            </p>
          ))}
        </Callout>
      )}
      <Droppable
        className="grow px-4 py-2"
        id={baseGroup.id}
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
                    id={operator.id}
                    key={operator.id}
                    data={{
                      type: 'operator',
                      container: baseGroup.id,
                    }}
                  >
                    {(attrs) => (
                      <OperatorItem
                        operator={operator}
                        onChange={onChange}
                        onRemove={() =>
                          edit(() => {
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
        {operatorAtoms.length === 0 && (
          <div className="relative min-h-36 flex flex-col items-center justify-center text-xs text-zinc-500">
            {active ? (
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
          active
            ? '!bg-purple-500 hover:!bg-purple-600 dark:!bg-purple-900 !text-white'
            : '!bg-gray-200 dark:!bg-gray-600',
        )}
      >
        <div
          className={clsx('flex items-center', active && 'grow')}
          ref={actionContainerRef}
          style={{
            minWidth: active
              ? actionContainerInitialWidthRef.current
              : undefined,
          }}
        >
          <Button
            minimal
            icon={
              <Icon
                icon={active ? 'tick' : 'aimpoints-target'}
                className="!text-inherit"
              />
            }
            className={clsx(
              '!rounded-none !text-inherit',
              active && 'grow !justify-start',
            )}
            onClick={() => {
              // 进入编辑模式时会少一个按钮，所以要把宽度固定住，防止布局突然变化
              if (!active && actionContainerRef.current) {
                const rect = actionContainerRef.current.getBoundingClientRect()
                actionContainerInitialWidthRef.current = rect.width
              }
              setActive(!active)
            }}
          >
            {active ? '完成' : '快捷编辑'}
          </Button>
          {!active && (
            <OperatorSelect
              markPicked
              onSelect={(name) => {
                addOperator(createOperator({ name }), baseGroup.id)
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

interface GroupItemProps {
  baseGroupAtom: PrimitiveAtom<BaseEditorGroup>
}
const GroupTitle = memo(({ baseGroupAtom }: GroupItemProps) => {
  const edit = useEdit()
  const favGroups = useAtomValue(editorFavGroupsAtom)
  const [baseGroup, setBaseGroup] = useAtom(baseGroupAtom)
  const id = baseGroup.id
  const [isNewlyAdded, setIsNewlyAdded] = useActiveState(
    editorAtoms.newlyAddedGroupIdAtom,
    id,
  )
  const [confirming, setConfirming] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const pendingFavGroup = useRef<WithId<FavGroup> | undefined>()

  const fuse = useMemo(() => {
    return new Fuse(favGroups, {
      keys: ['name'],
      threshold: 0.3,
    })
  }, [favGroups])

  useEffect(() => {
    if (isNewlyAdded) {
      titleInputRef.current?.focus()
      setIsNewlyAdded(false)
    }
  }, [isNewlyAdded, setIsNewlyAdded])

  const { debouncedQuery, updateQuery, onOptionMouseDown } = useDebouncedQuery({
    query: baseGroup.name,
    onQueryChange(query) {
      edit(() => {
        setBaseGroup((prev) => ({ ...prev, name: query }))
        return {
          action: 'set-group-name-' + baseGroup.id,
          desc: '修改干员组名称',
          squash: true,
        }
      })
    },
  })

  const filteredItems = useMemo(
    () =>
      debouncedQuery
        ? fuse.search(debouncedQuery).map((el) => el.item)
        : favGroups,
    [favGroups, fuse, debouncedQuery],
  )

  const setFromFavorite = useAtomCallback(
    useCallback(
      (get, set, mode: 'determine' | 'append' | 'overwrite') => {
        const favGroup = pendingFavGroup.current
        if (!favGroup || !favGroup.opers?.length) {
          return
        }
        const baseGroupAtoms = get(editorAtoms.baseGroupAtoms)
        const index = baseGroupAtoms.indexOf(baseGroupAtom)
        const groupAtom = get(editorAtoms.groupAtoms)[index]
        if (!groupAtom) {
          return
        }
        const group = get(groupAtom)
        if (mode === 'determine' && group.opers.length > 0) {
          setConfirming(true)
          return
        }
        const globalOperators = get(editorAtoms.operators)
        const favOperators = favGroup
          .opers!.map(createOperator)
          // 过滤掉已经存在的全局干员
          .filter(
            (favOperator) =>
              !globalOperators.find(
                (operator) => operator.id === favOperator.id,
              ),
          )
        edit(() => {
          if (mode === 'append') {
            set(groupAtom, (prev) => ({
              ...prev,
              name: favGroup.name,
              opers: [
                ...prev.opers,
                // 过滤掉组内干员
                ...favOperators.filter(
                  (favOperator) =>
                    !prev.opers.find(
                      (operator) => operator.id === favOperator.id,
                    ),
                ),
              ],
            }))
          } else {
            set(groupAtom, (prev) => ({
              ...prev,
              name: favGroup.name,
              opers: favOperators,
            }))
          }
          return {
            action: 'set-group-from-fav-' + group.id,
            desc: '从收藏中读取干员组',
            squash: false,
          }
        })
      },
      [baseGroupAtom, edit],
    ),
  )

  return (
    <>
      <Suggest<(typeof favGroups)[0]>
        className="grow"
        items={favGroups}
        itemListPredicate={() => filteredItems}
        resetOnQuery={false}
        query={baseGroup.name}
        onQueryChange={(query) => updateQuery(query, false)}
        itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
          <MenuItem
            roleStructure="listoption"
            key={item.id}
            className={clsx(modifiers.active && Classes.ACTIVE)}
            text={item.name}
            labelElement={
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Icon icon="person" size={12} />
                {item.opers?.length ?? 0}
              </div>
            }
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={onOptionMouseDown}
          />
        )}
        inputValueRenderer={() => baseGroup.name}
        onItemSelect={(item) => {
          pendingFavGroup.current = item
          setFromFavorite('determine')
        }}
        noResults={
          <MenuItem
            disabled
            text={favGroups.length ? '没有匹配的干员组' : '没有已收藏的干员组'}
          />
        }
        inputProps={{
          inputClassName:
            '!p-4 !pr-0 !border-0 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600 !shadow-none font-bold text-gray-800',
          size: 10,
          placeholder: '干员组名称*',
          inputRef: titleInputRef,
        }}
        popoverProps={{
          minimal: true,
        }}
      />
      <Dialog
        isOpen={confirming}
        className={Classes.ALERT}
        onClose={() => setConfirming(false)}
      >
        <div className={Classes.ALERT_BODY}>
          <Icon icon="info-sign" size={40} />
          <div className={Classes.ALERT_CONTENTS}>是否要替换掉已有的干员？</div>
        </div>
        <div className={Classes.ALERT_FOOTER}>
          <Button
            intent="primary"
            text="追加"
            onClick={() => {
              setFromFavorite('append')
              setConfirming(false)
            }}
          />
          <Button
            intent="primary"
            text="覆盖"
            onClick={() => {
              setFromFavorite('overwrite')
              setConfirming(false)
            }}
          />
          <Button text="取消" onClick={() => setConfirming(false)} />
        </div>
      </Dialog>
    </>
  )
})
GroupTitle.displayName = 'GroupTitle'
