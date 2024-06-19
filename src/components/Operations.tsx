import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  InputGroup,
} from '@blueprintjs/core'

import { UseOperationsParams } from 'apis/operation'
import { useAtom, useAtomValue } from 'jotai'
import { debounce } from 'lodash-es'
import { ComponentType, useMemo, useState } from 'react'

import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'
import { OperationSetList } from 'components/OperationSetList'
import { neoLayoutAtom } from 'store/pref'
import {
  selectedOperatorQueryAtom,
  selectedOperatorsAtom,
} from 'store/selectedOperators'

import { authAtom } from '../store/auth'
import { OperatorSelect } from './OperatorSelect'
import { withSuspensable } from './Suspensable'

export const Operations: ComponentType = withSuspensable(() => {
  const [queryParams, setQueryParams] = useState<
    Omit<UseOperationsParams, 'operator'>
  >({
    orderBy: 'hot',
  })
  const [selectedOperators, setSelectedOperators] = useAtom(
    selectedOperatorsAtom,
  )
  const selectedOperatorQuery = useAtomValue(selectedOperatorQueryAtom)
  const debouncedSetQueryParams = useMemo(
    () => debounce(setQueryParams, 500),
    [],
  )
  const [authState] = useAtom(authAtom)
  const [neoLayout, setNeoLayout] = useAtom(neoLayoutAtom)
  const [listMode, setListMode] = useState<'operation' | 'operationSet'>(
    'operation',
  )

  const filterNode = (
    <FormGroup label="筛选" contentClassName="flex flex-wrap">
      <ButtonGroup className="mr-2">
        <Button
          icon="document"
          active={listMode === 'operation'}
          onClick={() => setListMode('operation')}
        >
          作业
        </Button>
        <Button
          icon="folder-close"
          active={listMode === 'operationSet'}
          onClick={() => setListMode('operationSet')}
        >
          作业集
        </Button>
      </ButtonGroup>

      {!!authState.token && (
        <Button
          className=""
          icon="user"
          title="只显示我发布的作品"
          active={queryParams.byMyself}
          onClick={() => {
            setQueryParams((old) => ({
              ...old,
              byMyself: !old.byMyself,
            }))
          }}
        >
          看看我的
        </Button>
      )}
    </FormGroup>
  )

  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle className="mb-6 flex" icon="properties">
          <div className="grow">查找作业</div>
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
        {listMode === 'operation' && (
          <div className="flex flex-wrap items-end">
            <div className="flex mr-4">
              <FormGroup
                helperText={
                  selectedOperators.length
                    ? '点击干员标签以标记为排除该干员'
                    : undefined
                }
                className="max-w-md"
              >
                <InputGroup
                  className="[&>input]:!rounded-md"
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
                <InputGroup
                  className="mt-2 [&>input]:!rounded-md"
                  placeholder="关卡名、关卡类型、关卡编号"
                  leftIcon="area-of-interest"
                  size={64}
                  large
                  type="search"
                  enterKeyHint="search"
                  onChange={(e) =>
                    debouncedSetQueryParams((old) => ({
                      ...old,
                      levelKeyword: e.target.value.trim(),
                    }))
                  }
                  onBlur={() => debouncedSetQueryParams.flush()}
                />
                <OperatorSelect
                  className="mt-2"
                  operators={selectedOperatorQuery.split(',')}
                  onChange={setSelectedOperators}
                />
              </FormGroup>
            </div>
            <div className="flex flex-col">
              {filterNode}
              <FormGroup label="排序" className="mt-auto">
                <ButtonGroup>
                  <Button
                    icon="flame"
                    active={queryParams.orderBy === 'hot'}
                    onClick={() => {
                      setQueryParams((old) => ({ ...old, orderBy: 'hot' }))
                    }}
                  >
                    热度
                  </Button>
                  <Button
                    icon="time"
                    active={queryParams.orderBy === 'id'}
                    onClick={() => {
                      setQueryParams((old) => ({ ...old, orderBy: 'id' }))
                    }}
                  >
                    最新
                  </Button>
                  <Button
                    icon="eye-open"
                    active={queryParams.orderBy === 'views'}
                    onClick={() => {
                      setQueryParams((old) => ({ ...old, orderBy: 'views' }))
                    }}
                  >
                    访问量
                  </Button>
                </ButtonGroup>
              </FormGroup>
            </div>
          </div>
        )}

        {listMode === 'operationSet' && (
          <div className="flex flex-wrap items-end">
            <div className="flex mr-4">
              <FormGroup className="max-w-md">
                <InputGroup
                  className="[&>input]:!rounded-md"
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
              </FormGroup>
            </div>
            <div className="flex flex-col">{filterNode}</div>
          </div>
        )}
      </Card>

      <div className="tabular-nums">
        {listMode === 'operation' && (
          <OperationList {...queryParams} operator={selectedOperatorQuery} />
        )}
        {listMode === 'operationSet' && <OperationSetList {...queryParams} />}
      </div>
    </>
  )
})
Operations.displayName = 'Operations'
