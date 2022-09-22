import { Button } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { useEffect } from 'react'
import { SubmitHandler, useForm, UseFormSetError } from 'react-hook-form'
import { EditorOperator } from './EditorOperator'

export interface EditorPerformerOperatorProps {
  operator?: CopilotDocV1.Operator
  submit: (
    operator: CopilotDocV1.Operator,
    setError: UseFormSetError<CopilotDocV1.Operator>,
  ) => void
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
    if (operator) {
      reset(operator)
    }
  }, [operator])

  const onSubmit: SubmitHandler<CopilotDocV1.Operator> = (values) => {
    submit(
      {
        ...values,
        name: values.name.trim(),
      },
      setError,
    )
    reset()
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
          entityName="干员"
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
