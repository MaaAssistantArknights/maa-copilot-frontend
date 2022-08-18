import { OperationEditor } from 'components/editor/OperationEditor'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { ComponentType } from 'react'

export const CreatePage: ComponentType = withGlobalErrorBoundary(() => {
  return <OperationEditor />
})
