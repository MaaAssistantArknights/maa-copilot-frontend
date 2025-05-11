import { useSetAtom } from 'jotai'
import { useAtomDevtools } from 'jotai-devtools'
import { useAtomCallback } from 'jotai/utils'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import { useCallback, useLayoutEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { OperationEditor } from 'components/editor2/Editor'

import {
  createOperation,
  updateOperation,
  useOperation,
} from '../apis/operation'
import { withSuspensable } from '../components/Suspensable'
import { AppToaster } from '../components/Toaster'
import {
  defaultEditorState,
  editorAtoms,
  historyAtom,
} from '../components/editor2/editor-state'
import { toEditorOperation } from '../components/editor2/reconciliation'
import { operationLooseSchema } from '../components/editor2/validation/schema'
import { editorValidationAtom } from '../components/editor2/validation/validation'
import { toShortCode } from '../models/shortCode'
import { formatError } from '../utils/error'
import { wrapErrorMessage } from '../utils/wrapErrorMessage'

export const EditorPage = withSuspensable(() => {
  const params = useParams()
  const navigate = useNavigate()
  const id = params.id ? +params.id : undefined
  const isNew = !id
  const apiOperation = useOperation({
    id,
    suspense: true,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
  }).data
  const setEditorState = useSetAtom(editorAtoms.editor)

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAtomDevtools(historyAtom, { name: 'editorStateAtom' })
  }

  useLayoutEffect(() => {
    if (apiOperation) {
      setEditorState({
        operation: toEditorOperation(
          operationLooseSchema.parse(JSON.parse(apiOperation.content)),
        ),
        metadata: {
          visibility:
            apiOperation.status === CopilotInfoStatusEnum.Public
              ? 'public'
              : 'private',
        },
      })
    } else {
      setEditorState(defaultEditorState)
    }
  }, [apiOperation, setEditorState])

  const handleSubmit = useAtomCallback(
    useCallback(
      async (get, set) => {
        const result = set(editorValidationAtom)
        if (!result.success) {
          set(editorAtoms.errorsVisible, true)
          AppToaster.show({
            message: '作业内容存在错误，请检查',
            intent: 'danger',
          })
          return false
        }
        const operation = result.data
        const status =
          get(editorAtoms.metadata).visibility === 'public'
            ? CopilotInfoStatusEnum.Public
            : CopilotInfoStatusEnum.Private

        const upload = async () => {
          if (id) {
            await updateOperation({
              id,
              content: JSON.stringify(operation),
              status,
            })
            AppToaster.show({
              message: '作业更新成功',
              intent: 'success',
            })
            navigate(`/?op=${id}`)
          } else {
            const newId = await createOperation({
              content: JSON.stringify(operation),
              status,
            })
            AppToaster.show({
              message: '作业创建成功',
              intent: 'success',
            })
            if (newId) {
              navigate(`/?op=${newId}`)
            } else {
              navigate('/')
            }
          }
        }

        await wrapErrorMessage(
          (e) => '上传失败: ' + formatError(e),
          upload(),
        ).catch(console.warn)

        return true
      },
      [id, navigate],
    ),
  )

  return (
    <OperationEditor
      title={isNew ? '创建作业' : '修改作业 - ' + toShortCode({ id })}
      submitAction={isNew ? '发布作业' : '更新作业'}
      onSubmit={handleSubmit}
    />
  )
})
