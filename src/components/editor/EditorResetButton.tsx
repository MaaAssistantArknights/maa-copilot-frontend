import { Alert, Button, H4 } from '@blueprintjs/core'
import { useState } from 'react'
import { FieldValues, UseFormReset } from 'react-hook-form'

export const EditorResetButton = <T extends FieldValues>({
  reset,
  entityName,
}: {
  reset: UseFormReset<T>
  entityName: string
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  return (
    <>
      <Alert
        isOpen={resetDialogOpen}
        confirmButtonText="重置"
        cancelButtonText="取消"
        icon="reset"
        intent="danger"
        canOutsideClickCancel
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          reset()
          setResetDialogOpen(false)
        }}
      >
        <H4>重置{entityName}</H4>
        <p>确定要重置{entityName}吗？</p>
      </Alert>

      <Button
        className="ml-4"
        icon="reset"
        minimal
        intent="danger"
        onClick={() => setResetDialogOpen(true)}
      >
        重置...
      </Button>
    </>
  )
}
