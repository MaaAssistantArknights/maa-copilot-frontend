import { useAtomDevtools } from 'jotai-devtools'
import { get, noop } from 'lodash-es'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import microdiff from 'microdiff'
import {
  ComponentType,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { OperationEditor } from 'components/editor2/Editor'

import { useOperation } from '../apis/operation'
import { withSuspensable } from '../components/Suspensable'
import {
  EditorFormValues,
  createInitialEditorHistoryState,
  editorStateHistoryAtom,
  useEditorControls,
  useEditorHistory,
} from '../components/editor2/editor-state'
import { operationToFormValues } from '../components/editor2/reconciliation'
import { toCopilotOperation } from '../models/converter'
import { toShortCode } from '../models/shortCode'
import { AtomsHydrator } from '../utils/react'

export const EditorPage: ComponentType = withGlobalErrorBoundary(
  withSuspensable(() => {
    const params = useParams()
    const id = params.id ? +params.id : undefined
    const isNew = !id
    const submitAction = isNew ? '发布' : '更新'
    const apiOperation = useOperation({ id, suspense: true }).data

    if (process.env.NODE_ENV === 'development') {
      useAtomDevtools(editorStateHistoryAtom, { name: 'editorStateAtom' })
    }
    const { state } = useEditorHistory()
    const { update } = useEditorControls()

    const initialEditorAtomValue = useMemo(
      () =>
        apiOperation
          ? ([
              editorStateHistoryAtom,
              createInitialEditorHistoryState({
                form: operationToFormValues(toCopilotOperation(apiOperation)),
                visibility:
                  apiOperation.status === CopilotInfoStatusEnum.Public
                    ? 'public'
                    : 'private',
              }),
            ] as const)
          : undefined,
      [apiOperation],
    )

    const form = useForm<EditorFormValues>({})
    const { control, reset, watch } = form

    const isResetting = useRef(false)

    useLayoutEffect(() => {
      isResetting.current = true
      reset(JSON.parse(JSON.stringify(state.form)), {
        keepDefaultValues: false,
      })
      isResetting.current = false
    }, [state.form, reset])

    useEffect(() => {
      // reset() 的逻辑是，在内部的 values 被新的 values 覆盖之前，对每个 field 都进行一次 setValue()，
      // 并触发 watch()，这会导致前几次 watch() 传进来的内部 values 还是旧的，与当前 values 存在 diff，
      // 引发历史记录更新。这里的解决办法是检查是否正在调用 reset() 里的 setValue()，如果是，则直接跳过。
      const { unsubscribe } = watch((values, payload) => {
        if (isResetting.current && payload.name !== undefined) {
          // 正在调用 reset() 里的 setValue()，直接跳过
          return
        }
        update((prev) => {
          // JSON.stringify 比 isEqual 快一倍，缺点是会忽略 undefined 以及对属性顺序敏感，
          // 不过对这里的 state 来说没什么影响，如果以后发现有影响的话可以考虑换回 isEqual 或者其他更快的库
          if (JSON.stringify(prev.form) === JSON.stringify(values)) {
            return undefined
          }

          if (process.env.NODE_ENV === 'development') {
            const diffs = microdiff(prev.form, values)
            console.log(
              'diffs',
              diffs
                .map(
                  (d) =>
                    d.type +
                    ':' +
                    d.path.join('.') +
                    `(${(d as any).oldValue ?? '...'}, ${get(values, d.path) ?? '...'})`,
                )
                .join(', '),
            )
          }

          return {
            ...prev,
            // values 在 RHF 内部会被 mutate，所以需要复制一下
            form: JSON.parse(JSON.stringify(values)),
          }
        })
      })
      return () => unsubscribe()
    }, [control, watch, update])

    return (
      <FormProvider {...form}>
        <AtomsHydrator
          atomValues={initialEditorAtomValue ? [initialEditorAtomValue] : []}
        >
          <OperationEditor
            title={isNew ? '创建作业' : '修改作业 - ' + toShortCode({ id })}
            submitAction={isNew ? '发布作业' : '更新作业'}
            onSubmit={noop}
          />
        </AtomsHydrator>
      </FormProvider>
    )
  }),
)
