import { Button, Callout } from '@blueprintjs/core'

import { useEffect } from 'react'
import {
  FieldErrors,
  SubmitHandler,
  UseFormSetError,
  useForm,
} from 'react-hook-form'

import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { EditorOperator } from './EditorOperator'

export interface EditorPerformerOperatorProps {
  operator?: CopilotDocV1.Operator
  submit: (
    operator: CopilotDocV1.Operator,
    setError: UseFormSetError<CopilotDocV1.Operator>,
  ) => boolean
  onCancel: () => void
  categorySelector: JSX.Element
}

export const EditorPerformerOperator = ({
  operator,
  submit,
  onCancel,
  categorySelector,
}: EditorPerformerOperatorProps) => {
  const isNew = !operator

  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CopilotDocV1.Operator>()

  useEffect(() => {
    reset(operator, { keepDefaultValues: true })
  }, [reset, operator])

  const onSubmit: SubmitHandler<CopilotDocV1.Operator> = (values) => {
    values.name = values.name.trim()

    if (submit(values, setError)) {
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center mb-4">
        <CardTitle className="mb-0" icon="add">
          {categorySelector}
        </CardTitle>

        <div className="flex-1" />

        <EditorResetButton<CopilotDocV1.Operator>
          reset={reset}
          entityName="正在编辑的干员"
        />
      </div>

      <EditorOperator control={control} errors={errors} />

      <div className="flex items-start">
        <Button intent="primary" type="submit" icon={isNew ? 'add' : 'edit'}>
          {isNew ? '添加' : '保存'}
        </Button>

        {!isNew && (
          <Button icon="cross" className="ml-2" onClick={onCancel}>
            取消编辑
          </Button>
        )}
      </div>
    </form>
  )
}
