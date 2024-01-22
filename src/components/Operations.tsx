import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  InputGroup,
  Switch
} from '@blueprintjs/core'

import { UseOperationsParams } from 'apis/query'
import { useAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { ComponentType, useMemo, useState } from 'react'

import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'

import { neoLayoutAtom } from 'store/pref'
import { authAtom } from '../store/auth'
import { OperatorSelect } from './OperatorSelect'
import { withSuspensable } from './Suspensable'

export const Operations: ComponentType = withSuspensable(() => {
  const [queryParams, setQueryParams] = useState<UseOperationsParams>({
    orderBy: 'hot',
  })
  const debouncedSetQueryParams = useMemo(
    () => debounce(setQueryParams, 500),
    [],
  )
  const [authState] = useAtom(authAtom)
  const [neoLayout, setNeoLayout] = useAtom(neoLayoutAtom)

  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle className="mb-4" icon="properties">
          查找作业
        </CardTitle>
        <FormGroup
          helperText={
            queryParams.operator?.length
              ? '点击干员标签以标记为排除该干员'
              : undefined
          }
          label="搜索"
          className="mt-2 max-w-md"
        >
          <InputGroup
            className="[&>input]:!rounded-md"
            placeholder="标题、描述、神秘代码"
            leftIcon="search"
            size={64}
            large
            type="search"
            enterKeyHint="search"
            onChange={(e) =>
              debouncedSetQueryParams((old) => ({
                ...old,
                document: e.target.value.trim(),
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
            operators={queryParams.operator?.split(',') || []}
            onChange={(operators) =>
              setQueryParams((old) => ({
                ...old,
                operator: operators.join(','),
              }))
            }
          />
        </FormGroup>
        <FormGroup label="排序" contentClassName="flex flex-wrap gap-y-2 gap-x-2">
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

          {!!authState.token && (
            <Button
              className="ml-auto"
              icon="user"
              title="只显示我发布的作业"
              active={queryParams.byMyself}
              onClick={() => {
                setQueryParams((old) => ({ ...old, byMyself: !old.byMyself }))
              }}
            >
              看看我的
            </Button>
          )}

          <Switch checked={neoLayout} onChange={(e) => {
            setNeoLayout((e.target as HTMLInputElement).checked)
          }}>
            启用新版布局
          </Switch>
        </FormGroup>
      </Card>

      <div className="tabular-nums">
        <OperationList {...queryParams} neoLayout={neoLayout} />
      </div>
    </>
  )
})
