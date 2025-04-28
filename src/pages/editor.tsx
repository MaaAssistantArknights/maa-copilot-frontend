import { useAtomDevtools } from 'jotai-devtools'
import { useAtomCallback } from 'jotai/utils'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
  defaultEditorState,
  editorAtoms,
  historyAtom,
} from '../components/editor2/editor-state'
import { toEditorOperation } from '../components/editor2/reconciliation'
import { operationLooseSchema } from '../components/editor2/validation/schema'
import { editorValidationAtom } from '../components/editor2/validation/validation'
import { toShortCode } from '../models/shortCode'
import { formatError } from '../utils/error'
import { AtomsHydrator } from '../utils/react'
import { wrapErrorMessage } from '../utils/wrapErrorMessage'

export const EditorPage = withGlobalErrorBoundary(
  withSuspensable(() => {
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

    if (process.env.NODE_ENV === 'development') {
      useAtomDevtools(historyAtom, { name: 'editorStateAtom' })
    }

    const initialEditorAtomValue = useMemo(
      () =>
        [
          [
            editorAtoms.editor,
            apiOperation
              ? {
                  operation: toEditorOperation(
                    operationLooseSchema.parse(
                      JSON.parse(apiOperation.content),
                    ),
                  ),
                  metadata: {
                    visibility:
                      apiOperation.status === CopilotInfoStatusEnum.Public
                        ? 'public'
                        : 'private',
                  },
                }
              : defaultEditorState,
          ],
        ] as const,
      [apiOperation],
    )

    const handleSubmit = useAtomCallback(
      useCallback(
        async (get, set) => {
          const result = set(editorValidationAtom)
          if (!result.success) {
            AppToaster.show({
              message: '作业内容存在错误，请检查',
              intent: 'danger',
            })
            return
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
                action: {
                  text: '点击查看',
                  className: '!px-1',
                  onClick: () => navigate(`/?op=${id}`),
                },
              })
            } else {
              await createOperation({
                content: JSON.stringify(operation),
                status,
              })
              AppToaster.show({
                message: '作业创建成功',
                intent: 'success',
                action: {
                  text: '点击查看',
                  className: '!px-1',
                  onClick: () => navigate(`/?op=${id}`),
                },
              })
            }
          }

          await wrapErrorMessage(
            (e) => '上传失败: ' + formatError(e),
            upload(),
          ).catch(console.warn)
        },
        [id, navigate],
      ),
    )

    return (
      <AtomsHydrator atomValues={initialEditorAtomValue}>
        <OperationEditor
          title={isNew ? '创建作业' : '修改作业 - ' + toShortCode({ id })}
          submitAction={isNew ? '发布作业' : '更新作业'}
          onSubmit={handleSubmit}
        />
      </AtomsHydrator>
    )
  }),
)
EditorPage.displayName = 'EditorPage'
