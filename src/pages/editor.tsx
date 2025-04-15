import { useAtomDevtools } from 'jotai-devtools'
import { get } from 'lodash-es'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import microdiff from 'microdiff'
import { ComponentType, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { OperationEditor } from 'components/editor2/Editor'

import {
  createOperation,
  updateOperation,
  useOperation,
} from '../apis/operation'
import { withSuspensable } from '../components/Suspensable'
import { AppToaster } from '../components/Toaster'
import {
  EditorFormValues,
  defaultFormValues,
  editorStateAtom,
  useAtomHistory,
} from '../components/editor2/editor-state'
import { patchOperation, toMaaOperation } from '../components/editor/converter'
import { validateOperation } from '../components/editor/validation'
import { toCopilotOperation } from '../models/converter'
import { Operation } from '../models/operation'
import { toShortCode } from '../models/shortCode'
import { NetworkError, formatError } from '../utils/error'

export const EditorPage: ComponentType = withGlobalErrorBoundary(
  withSuspensable(() => {
    const params = useParams()
    const id = params.id ? +params.id : undefined
    const isNew = !id
    const submitAction = isNew ? '发布' : '更新'
    const apiOperation = useOperation({ id, suspense: true }).data

    const [isFirstRender, setIsFirstRender] = useState(true)
    useEffect(() => setIsFirstRender(false), [])

    const { state, update } = useAtomHistory(editorStateAtom)
    useAtomDevtools(editorStateAtom, { name: 'editorStateAtom' })

    const form = useForm<EditorFormValues>({
      // set form values by fetched data, or an empty operation by default
      defaultValues: apiOperation
        ? toCopilotOperation(apiOperation)
        : defaultFormValues,
      // https://github.com/react-hook-form/react-hook-form/issues/10617
      values: isFirstRender ? undefined : state.form,
      resetOptions: {
        keepDefaultValues: true,
      },
    })
    const {
      control,
      handleSubmit,
      getValues,
      trigger,
      watch,
      setError,
      clearErrors,
    } = form

    useEffect(() => {
      // 当 useForm 的 values 更新的时候内部会调用 reset()，而 reset() 的逻辑是在内部的 values 被新的 values 覆盖之前，
      // 对每个 field 都进行一次 setValue()，并触发 watch()，这会导致前几次 watch() 传进来的内部 values 还是旧的，
      // 与当前 values 存在 diff，引发历史记录更新。
      // 这里的解决办法是检查是否正在调用 reset() 里的 setValue()，如果是，则直接跳过。
      let isResetting = false
      let originalReset = control._reset
      if ((originalReset as any)._original) {
        originalReset = (originalReset as any)._original
      }
      control._reset = (...args) => {
        isResetting = true
        originalReset.apply(control, args)
        isResetting = false
      }
      const { unsubscribe } = watch((values, payload) => {
        if (isResetting && payload.name !== undefined) {
          // 正在调用 reset() 里的 setValue()，直接跳过
          return
        }
        update((prev) => {
          const diffs = microdiff(prev.form, values)
          if (
            diffs.length === 0 ||
            diffs.every(
              (d) =>
                (d.type === 'CREATE' && !get(values, d.path)) ||
                (d.type === 'REMOVE' && !d.oldValue),
            )
          ) {
            return undefined
          }
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

          return {
            ...prev,
            form: values,
          }
        })
      })
      return () => unsubscribe()
    }, [control, watch, update])

    const [operationStatus, setOperationStatus] = useState<Operation['status']>(
      apiOperation ? apiOperation.status : CopilotInfoStatusEnum.Public,
    )
    const [uploading, setUploading] = useState(false)

    const triggerValidation = async () => {
      clearErrors()

      if (!(await trigger())) {
        return false
      }

      const operation = toMaaOperation(getValues())

      return validateOperation(operation, setError)
    }

    const onSubmit = handleSubmit(async (raw: EditorFormValues) => {
      try {
        setUploading(true)

        const operation = toMaaOperation(raw)

        patchOperation(operation)

        if (!validateOperation(operation, setError)) {
          return
        }

        try {
          if (isNew) {
            await createOperation({
              content: JSON.stringify(operation),
              status: operationStatus,
            })
          } else {
            await updateOperation({
              id,
              content: JSON.stringify(operation),
              status: operationStatus,
            })
          }
        } catch (e) {
          // handle a special error
          if (
            e instanceof Error &&
            e.message.includes('is less than or equal to 0')
          ) {
            const actionWithNegativeCostChanges =
              operation.actions?.findIndex(
                (action) => (action?.cost_changes as number) < 0,
              ) ?? -1

            if (actionWithNegativeCostChanges !== -1) {
              throw new Error(
                `目前暂不支持上传费用变化量为负数的动作（第${
                  actionWithNegativeCostChanges + 1
                }个动作）`,
              )
            }
          }

          throw e
        }

        AppToaster.show({
          intent: 'success',
          message: `作业${submitAction}成功`,
        })
      } catch (e) {
        setError('global' as any, {
          message:
            e instanceof NetworkError
              ? `作业${submitAction}失败：${e.message}`
              : formatError(e),
        })
      } finally {
        setUploading(false)
      }
    })

    return (
      <FormProvider {...form}>
        <OperationEditor
          title={isNew ? '创建作业' : '修改作业 - ' + toShortCode({ id })}
          submitAction={isNew ? '发布作业' : '更新作业'}
          onSubmit={onSubmit}
        />
      </FormProvider>
    )
  }),
)
