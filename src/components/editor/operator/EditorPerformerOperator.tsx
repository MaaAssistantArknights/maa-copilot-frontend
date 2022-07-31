import { Button } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { SubmitHandler, useForm } from 'react-hook-form'
import { EditorOperator } from './EditorOperator'
import { EditorPerformerChildProps } from './EditorPerformer'

export const EditorPerformerOperator = ({
  submit,
  categorySelector,
}: EditorPerformerChildProps) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Operator>()

  const onSubmit: SubmitHandler<CopilotDocV1.Operator> = (values) => {
    submit(values)
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
