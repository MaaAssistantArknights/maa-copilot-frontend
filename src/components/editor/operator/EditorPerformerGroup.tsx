import { Button } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { FormField2 } from 'components/FormField'
import { SubmitHandler, useForm } from 'react-hook-form'
import { EditorOperatorSelect } from './EditorOperatorSelect'

export interface EditorPerformerProps {
  submit: (action: CopilotDocV1.Operator) => void
  categorySelector: JSX.Element
}

export const EditorPerformerGroup = ({
  submit,
  categorySelector,
}: EditorPerformerProps) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Group>()

  const onSubmit: SubmitHandler<CopilotDocV1.Group> = (values) => {
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

        <EditorResetButton<CopilotDocV1.Action>
          reset={reset}
          entityName="干员组"
        />
      </div>

      <FormField2 label="干员组名" field="name" error={errors.name} asterisk>
        <EditorOperatorSelect<CopilotDocV1.Group>
          control={control}
          name="name"
        />
      </FormField2>

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
