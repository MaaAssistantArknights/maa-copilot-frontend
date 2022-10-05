import { Button } from '@blueprintjs/core'

import { ComponentType, useState } from 'react'
import { DeepPartial, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { OperationEditor } from 'components/editor/OperationEditor'
import type { CopilotDocV1 } from 'models/copilot.schema'

import {
  requestOperationUpdate,
  requestOperationUpload,
} from '../apis/copilotOperation'
import { useOperation } from '../apis/query'
import { withSuspensable } from '../components/Suspensable'
import { AppToaster } from '../components/Toaster'
import { patchOperation, toMaaOperation } from '../components/editor/converter'
import { SourceEditorButton } from '../components/editor/source/SourceEditorButton'
import { validateOperation } from '../components/editor/validation'
import { toCopilotOperation } from '../models/converter'
import { MinimumRequired } from '../models/operation'
import { NetworkError } from '../utils/fetcher'

const defaultOperation: DeepPartial<CopilotDocV1.Operation> = {
  minimumRequired: MinimumRequired.V4_0_0,
}

export const CreatePage: ComponentType = withGlobalErrorBoundary(
  withSuspensable(() => {
    const { id } = useParams()

    const isNew = !id
    const submitAction = isNew ? '发布' : '更新'

    const apiOperation = useOperation(id).data?.data

    const form = useForm<CopilotDocV1.Operation>({
      // set form values by fetched data, or an empty operation by default
      defaultValues: apiOperation
        ? toCopilotOperation(apiOperation)
        : defaultOperation,
    })
    const { handleSubmit, getValues, trigger, setError, clearErrors } = form

    const [uploading, setUploading] = useState(false)

    const triggerValidation = async () => {
      clearErrors()

      if (!(await trigger())) {
        return false
      }

      const operation = toMaaOperation(getValues())

      return validateOperation(operation, setError)
    }

    const onSubmit = handleSubmit(async (raw: CopilotDocV1.Operation) => {
      try {
        setUploading(true)

        const operation = toMaaOperation(raw)

        patchOperation(operation)

        if (!validateOperation(operation, setError)) {
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
    })

    return (
      <OperationEditor
        form={form}
        toolbar={
          <>
            <SourceEditorButton
              className="ml-4"
              form={form}
              triggerValidation={triggerValidation}
            />
            <Button
              intent="primary"
              className="ml-4"
              icon="upload"
              text={submitAction}
              loading={uploading}
              onClick={() => {
                // manually clear the `global` error or else the submission will be blocked
                clearErrors()
                onSubmit()
              }}
            />
          </>
        }
      />
    )
  }),
)
