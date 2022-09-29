import { Button } from '@blueprintjs/core'

import { ComponentType, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import {
  OperationEditor,
  OperationEditorProps,
} from 'components/editor/OperationEditor'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { useLevels } from '../apis/arknights'
import {
  requestOperationUpdate,
  requestOperationUpload,
} from '../apis/copilotOperation'
import { useOperation } from '../apis/query'
import { withSuspensable } from '../components/Suspensable'
import { AppToaster } from '../components/Toaster'
import { SourceViewerButton } from '../components/editor/SourceViewerButton'
import { toQualifiedOperation } from '../components/editor/converter'
import { validateOperation } from '../components/editor/validation'
import { toCopilotOperation } from '../models/converter'
import { NetworkError } from '../utils/fetcher'

export const CreatePage: ComponentType = withGlobalErrorBoundary(
  withSuspensable(() => {
    const { id } = useParams()

    const isNew = !id
    const submitAction = isNew ? '发布' : '更新'

    const apiOperation = useOperation(id).data?.data
    const operation = useMemo(
      () => apiOperation && toCopilotOperation(apiOperation),
      [apiOperation],
    )

    const levels = useLevels({ suspense: false }).data?.data || []

    const [uploading, setUploading] = useState(false)

    const editorToolbar: OperationEditorProps['toolbar'] = (
      handleSubmit,
      setError,
    ) => {
      const exportOperation = () =>
        new Promise<CopilotDocV1.OperationSnakeCased | undefined>((resolve) => {
          handleSubmit((raw) => {
            try {
              const operation = toQualifiedOperation(raw, levels)

              if (validateOperation(operation, setError)) {
                resolve(operation)
              }
            } catch (e) {
              setError('global' as any, {
                message: (e as Error).message || String(e),
              })
            } finally {
              resolve(undefined)
            }
          })()
        })

      const onSubmit = async () => {
        try {
          setUploading(true)

          const operation = await exportOperation()

          if (!operation) {
            return
          }

          if (isNew) {
            await requestOperationUpload(JSON.stringify(operation))
          } else {
            await requestOperationUpdate(id, JSON.stringify(operation))
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
                : (e as Error).message || String(e),
          })
        } finally {
          setUploading(false)
        }
      }

      return (
        <>
          <SourceViewerButton className="ml-4" getSource={exportOperation} />
          <Button
            intent="primary"
            className="ml-4"
            icon="upload"
            text={submitAction}
            loading={uploading}
            onClick={onSubmit}
          />
        </>
      )
    }

    return <OperationEditor operation={operation} toolbar={editorToolbar} />
  }),
)
