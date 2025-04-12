import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Divider,
  H6,
  InputGroup,
  Tab,
  Tabs,
} from '@blueprintjs/core'

import { UseOperationsParams } from 'apis/operation'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { MaaUserInfo } from 'maa-copilot-client'
import { ComponentType, useMemo, useState } from 'react'

import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'
import { OperationSetList } from 'components/OperationSetList'
import { neoLayoutAtom } from 'store/pref'

import { Operation } from '../models/operation'
import { LevelSelect } from './LevelSelect'
import { OperatorFilter, useOperatorFilter } from './OperatorFilter'
import { withSuspensable } from './Suspensable'
import { UserFilter } from './UserFilter'
import { AddToOperationSetButton } from './operation-set/AddToOperationSet'

export const Operations: ComponentType = withSuspensable(() => {
  const [queryParams, setQueryParams] = useState<
    Omit<UseOperationsParams, 'operator'>
  >({
    limit: 10,
    orderBy: 'hot',
  })
  const debouncedSetQueryParams = useMemo(
    () => debounce(setQueryParams, 500),
    [],
  )

  const { operatorFilter, setOperatorFilter } = useOperatorFilter()
  const [selectedUser, setSelectedUser] = useState<MaaUserInfo>()
  const [neoLayout, setNeoLayout] = useAtom(neoLayoutAtom)
  const [tab, setTab] = useState<'operation' | 'operationSet'>('operation')
  const [multiselect, setMultiselect] = useState(false)
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>([])

  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle className="mb-6 flex" icon="properties">
          <Tabs
            className="pl-2 [&>div]:space-x-2 [&>div]:space-x-reverse"
            id="operation-tabs"
            large
            selectedTabId={tab}
            onChange={(newTab) =>
              setTab(newTab as 'operation' | 'operationSet')
            }
          >
            <Tab
              className={clsx(
                'text-inherit',
                tab !== 'operation' && 'opacity-75',
              )}
              id="operation"
              title="作业"
            />
            <Divider className="self-center h-[1em]" />
            <Tab
              className={clsx(
                'text-inherit',
                tab !== 'operationSet' && 'opacity-75',
              )}
              id="operationSet"
              title="作业集"
            />
          </Tabs>
          <Button
            minimal
            icon="multi-select"
            title="启动多选"
            className="ml-auto mr-2"
            active={multiselect}
            onClick={() => setMultiselect((v) => !v)}
          />
          <ButtonGroup>
            <Button
              icon="grid-view"
              active={neoLayout}
              onClick={() => setNeoLayout(true)}
            />
            <Button
              icon="list"
              active={!neoLayout}
              onClick={() => setNeoLayout(false)}
            />
          </ButtonGroup>
        </CardTitle>
        {tab === 'operation' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <InputGroup
                className="max-w-md [&>input]:!rounded-md"
                placeholder="标题、描述、神秘代码"
                leftIcon="search"
                size={64}
                large
                type="search"
                enterKeyHint="search"
                defaultValue={queryParams.keyword}
                onChange={(e) =>
                  debouncedSetQueryParams((old) => ({
                    ...old,
                    keyword: e.target.value.trim(),
                  }))
                }
                onBlur={() => debouncedSetQueryParams.flush()}
              />
              <div className="flex flex-wrap gap-1">
                <LevelSelect
                  value={queryParams.levelKeyword ?? ''}
                  onChange={(level) =>
                    setQueryParams((old) => ({
                      ...old,
                      levelKeyword: level,
                    }))
                  }
                />
                <UserFilter
                  user={selectedUser}
                  onChange={(user) => {
                    setSelectedUser(user)
                    setQueryParams((old) => ({
                      ...old,
                      uploaderId: user?.id,
                    }))
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <OperatorFilter
                className=""
                filter={operatorFilter}
                onChange={setOperatorFilter}
              />
              <div className="flex flex-wrap items-center ml-auto">
                <H6 className="mb-0 mr-1 opacity-75">排序:</H6>
                <ButtonGroup minimal className="flex-wrap">
                  {(
                    [
                      {
                        icon: 'flame',
                        text: '热度',
                        orderBy: 'hot',
                        active: queryParams.orderBy === 'hot',
                      },
                      {
                        icon: 'time',
                        text: '最新',
                        orderBy: 'id',
                        active: queryParams.orderBy === 'id',
                      },
                      {
                        icon: 'eye-open',
                        text: '访问量',
                        orderBy: 'views',
                        active: queryParams.orderBy === 'views',
                      },
                    ] as const
                  ).map(({ icon, text, orderBy, active }) => (
                    <Button
                      key={orderBy}
                      className={clsx(
                        '!px-2 !py-1 !border-none [&>.bp4-icon]:!mr-1',
                        !active && 'opacity-75 !font-normal',
                      )}
                      icon={icon}
                      intent={active ? 'primary' : 'none'}
                      onClick={() => {
                        setQueryParams((old) => ({ ...old, orderBy }))
                      }}
                    >
                      {text}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </div>
            {multiselect && (
              <Callout className="mt-2 p-0 select-none">
                <details>
                  <summary className="px-2 py-4 cursor-pointer hover:bg-zinc-500 hover:bg-opacity-5">
                    已选择 {selectedOperations.length} 份作业
                  </summary>
                  <div className="p-2 flex flex-wrap gap-1">
                    {selectedOperations.map((operation) => (
                      <Button
                        key={operation.id}
                        small
                        minimal
                        rightIcon="cross"
                        onClick={() =>
                          setSelectedOperations((old) =>
                            old.filter((op) => op.id !== operation.id),
                          )
                        }
                      >
                        {operation.parsedContent.doc.title}
                      </Button>
                    ))}
                  </div>
                </details>
                <AddToOperationSetButton
                  minimal
                  outlined
                  intent="primary"
                  icon="add-to-folder"
                  className="absolute top-2 right-2"
                  disabled={selectedOperations.length === 0}
                  operationIds={selectedOperations.map((op) => op.id)}
                >
                  添加到作业集
                </AddToOperationSetButton>
              </Callout>
            )}
          </>
        )}

        {tab === 'operationSet' && (
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup
              className="max-w-md [&>input]:!rounded-md"
              placeholder="标题、描述、神秘代码"
              leftIcon="search"
              size={64}
              large
              type="search"
              enterKeyHint="search"
              defaultValue={queryParams.keyword}
              onChange={(e) =>
                debouncedSetQueryParams((old) => ({
                  ...old,
                  keyword: e.target.value.trim(),
                }))
              }
              onBlur={() => debouncedSetQueryParams.flush()}
            />
            <UserFilter
              user={selectedUser}
              onChange={(user) => {
                setSelectedUser(user)
                setQueryParams((old) => ({
                  ...old,
                  uploaderId: user?.id,
                }))
              }}
            />
          </div>
        )}
      </Card>

      <div className="tabular-nums">
        {tab === 'operation' && (
          <OperationList
            {...queryParams}
            multiselect={multiselect}
            selectedOperations={selectedOperations}
            onSelect={(operation, selected) =>
              setSelectedOperations((old) => {
                const newList = old.filter((op) => op.id !== operation.id)
                if (selected) {
                  newList.push(operation)
                }
                return newList
              })
            }
            operator={operatorFilter.enabled ? operatorFilter : undefined}
            // 按热度排序时列表前几页的变化不会太频繁，可以不刷新第一页，节省点流量
            revalidateFirstPage={queryParams.orderBy !== 'hot'}
          />
        )}
        {tab === 'operationSet' && (
          <OperationSetList
            {...queryParams}
            creatorId={queryParams.uploaderId}
          />
        )}
      </div>
    </>
  )
})
Operations.displayName = 'Operations'
