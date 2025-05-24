import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Divider,
  H6,
  InputGroup,
  MenuItem,
  Tab,
  Tabs,
} from '@blueprintjs/core'
import type { Popover2 } from '@blueprintjs/popover2'
import { MultiSelect2 } from '@blueprintjs/select'

import { UseOperationsParams } from 'apis/operation'
import clsx from 'clsx'
import Fuse from 'fuse.js'
import { useAtom } from 'jotai'
import { MaaUserInfo } from 'maa-copilot-client'
import {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'
import { OperationSetList } from 'components/OperationSetList'
import { neoLayoutAtom } from 'store/pref'

import { useLevels } from '../apis/level'
import { useTranslation } from '../i18n/i18n'
import { isHardMode } from '../models/level'
import { Level } from '../models/operation'
import { useDebouncedQuery } from '../utils/useDebouncedQuery'
import { OperatorFilter, useOperatorFilter } from './OperatorFilter'
import { withSuspensable } from './Suspensable'
import { UserFilter } from './UserFilter'

// 添加 LevelTag 组件用于在 MultiSelect 中显示关卡标签
const LevelTag: ComponentType<{ level: Level }> = ({ level }) => {
  return (
    <div className="flex items-center">
      {level.catThree} {level.name}
    </div>
  )
}

export const Operations: ComponentType = withSuspensable(() => {
  const t = useTranslation()
  const [queryParams, setQueryParams] = useState<
    Omit<UseOperationsParams, 'operator'>
  >({
    limit: 10,
    orderBy: 'hot',
  })

  const { operatorFilter, setOperatorFilter } = useOperatorFilter()
  const [selectedUser, setSelectedUser] = useState<MaaUserInfo>()
  const [neoLayout, setNeoLayout] = useAtom(neoLayoutAtom)
  const [tab, setTab] = useState<'operation' | 'operationSet'>('operation')
  const [multiselect, setMultiselect] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const { data } = useLevels()
  const levels = useMemo(
    () =>
      data
        // to simplify the list, we only show levels in normal mode
        .filter((level) => !isHardMode(level.stageId))
        .sort((a, b) => a.levelId.localeCompare(b.levelId)),
    [data],
  )

  const fuse = useMemo(
    () =>
      new Fuse(levels, {
        keys: ['name', 'catTwo', 'catThree', 'stageId'],
        threshold: 0.3,
      }),
    [levels],
  )
  const popoverRef = useRef<Popover2>(null)

  const [selectedLevels, setSelectedLevels] = useState<Level[]>([])

  const { query, trimmedDebouncedQuery, updateQuery, onOptionMouseDown } =
    useDebouncedQuery()

  const updateQueryByLevel = useCallback(() => {
    const levelKeywords = selectedLevels.map((level) => level.stageId)
    setQueryParams((old) => ({
      ...old,
      levelKeyword: levelKeywords[0] || undefined,
    }))
  }, [selectedLevels])

  const handleSearch = useCallback(() => {
    setQueryParams((old) => ({
      ...old,
      keyword: searchKeyword.trim(),
    }))
  }, [searchKeyword])

  useEffect(() => {
    updateQueryByLevel()
  }, [updateQueryByLevel])

  const filteredLevels = useMemo(() => {
    if (!trimmedDebouncedQuery) {
      return []
    }
    const ret = fuse.search(trimmedDebouncedQuery).map((el) => el.item)
    if (ret.length === 0 && popoverRef.current?.popoverElement) {
      popoverRef.current.popoverElement.style.display = 'none'
    }
    return ret
  }, [trimmedDebouncedQuery, fuse])

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
              title={t.components.Operations.operations}
            />
            <Divider className="self-center h-[1em]" />
            <Tab
              className={clsx(
                'text-inherit',
                tab !== 'operationSet' && 'opacity-75',
              )}
              id="operationSet"
              title={t.components.Operations.operation_sets}
            />
          </Tabs>
          <Button
            minimal
            icon="multi-select"
            title={t.components.Operations.enable_multi_select}
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
              <div className="flex max-w-md flex-grow">
                <MultiSelect2<Level>
                  popoverRef={popoverRef}
                  className="flex-grow"
                  query={query}
                  onQueryChange={(query) => {
                    updateQuery(query, false)
                    setSearchKeyword(query)
                  }}
                  items={levels}
                  itemRenderer={(
                    item,
                    { handleClick, handleFocus, modifiers },
                  ) => (
                    <MenuItem
                      roleStructure="listoption"
                      key={item.stageId}
                      className={clsx(modifiers.active && Classes.ACTIVE)}
                      text={`${item.catThree} ${item.name}`}
                      onClick={handleClick}
                      onFocus={handleFocus}
                      onMouseDown={onOptionMouseDown}
                      selected={selectedLevels.some(
                        (l) => l.stageId === item.stageId,
                      )}
                      disabled={modifiers.disabled}
                    />
                  )}
                  itemListPredicate={() => filteredLevels}
                  selectedItems={selectedLevels}
                  placeholder={t.components.Operations.search_placeholder}
                  tagInputProps={{
                    className: '!flex !p-0 !pl-[5px]',
                    large: true,
                    tagProps: {
                      minimal: true,
                      className: '!py-0 !pl-0',
                    },
                    inputProps: {
                      className: '!leading-8',
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                          handleSearch()
                        }
                      },
                    },
                  }}
                  resetOnSelect={true}
                  tagRenderer={(item) => <LevelTag level={item} />}
                  popoverProps={{
                    popoverClassName: trimmedDebouncedQuery
                      ? undefined
                      : '[&_.bp4-popover2-content]:!p-0',
                    placement: 'bottom-start',
                    minimal: true,
                    matchTargetWidth: true,
                  }}
                  onItemSelect={(level) => {
                    if (
                      !selectedLevels.some((l) => l.stageId === level.stageId)
                    ) {
                      // 只选定一个 后端暂未支持多Level查询
                      setSelectedLevels([level])
                    }
                  }}
                  onRemove={(level) => {
                    setSelectedLevels(
                      selectedLevels.filter((l) => l.stageId !== level.stageId),
                    )
                  }}
                  onClear={() => {
                    setSelectedLevels([])
                  }}
                />
                <Button
                  minimal
                  large
                  icon="search"
                  text="搜索"
                  className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={handleSearch}
                  aria-label="搜索"
                />
              </div>
              <div className="flex flex-wrap gap-1">
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
                <H6 className="mb-0 mr-1 opacity-75">
                  {t.components.Operations.sort_by}
                </H6>
                <ButtonGroup minimal className="flex-wrap">
                  {(
                    [
                      {
                        icon: 'flame',
                        text: t.components.Operations.popularity,
                        orderBy: 'hot',
                        active: queryParams.orderBy === 'hot',
                      },
                      {
                        icon: 'time',
                        text: t.components.Operations.newest,
                        orderBy: 'id',
                        active: queryParams.orderBy === 'id',
                      },
                      {
                        icon: 'eye-open',
                        text: t.components.Operations.views,
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
          </>
        )}

        {tab === 'operationSet' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex">
              <InputGroup
                className="[&>input]:!rounded-md max-w-md"
                placeholder={t.components.Operations.search_placeholder}
                size={64}
                large
                type="search"
                enterKeyHint="search"
                defaultValue={queryParams.keyword}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              <Button
                minimal
                large
                icon="search"
                text="搜索"
                className=" ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={handleSearch}
              />
            </div>
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
