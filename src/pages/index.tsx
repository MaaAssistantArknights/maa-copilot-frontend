import { Card } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { OperationEditorLauncher } from 'components/editor/OperationEditorLauncher'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { Operations } from 'components/Operations'
import { OperationUploaderLauncher } from 'components/uploader/OperationUploaderLauncher'
import { ComponentType } from 'react'

export const IndexPage: ComponentType = withGlobalErrorBoundary(() => {
  return (
    <div className="flex flex-col md:flex-row px-8 mt-8 pb-16">
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8">
        <Operations />
      </div>
      <div className="md:w-1/3 order-1 md:order-2">
        <Card className="flex flex-col mb-4 space-y-2">
          <CardTitle icon="add" className="mb-4">
            创建新作业
          </CardTitle>

          <OperationEditorLauncher />

          <OperationUploaderLauncher />
        </Card>
      </div>
    </div>
  )
})
