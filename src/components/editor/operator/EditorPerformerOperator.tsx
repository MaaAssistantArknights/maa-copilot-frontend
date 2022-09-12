import { Button } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { SubmitHandler, useForm } from 'react-hook-form'
import { handleFieldError } from '../../../utils/fieldError'
import { EditorOperator } from './EditorOperator'

export interface EditorPerformerOperatorProps {
  submit: (operator: CopilotDocV1.Operator) => void
  categorySelector: JSX.Element
}

export const EditorPerformerOperator = ({
  submit,
  categorySelector,
}: EditorPerformerOperatorProps) => {
  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Operator>()

  const onSubmit: SubmitHandler<CopilotDocV1.Operator> = (values) => {
    try {
      submit({
        ...values,
        name: values.name.trim(),
      })
      reset()
    } catch (e) {
      handleFieldError(setError, e)
      console.warn(e)
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
          entityName="干员"
        />
      </div>

      <EditorOperator control={control} errors={errors} />

      <Button
        disabled={!isValid && !isDirty}
        intent="primary"
        type="submit"
        icon="add"
      >
        添加
      </Button>
    </form>
  )
}
