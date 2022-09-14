import { Button, InputGroup } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { FormField } from 'components/FormField'
import { SubmitHandler, useForm, UseFormSetError } from 'react-hook-form'
import { handleFieldError } from '../../../utils/fieldError'

export interface EditorPerformerGroupProps {
  submit: (group: CopilotDocV1.Group) => void
  categorySelector: JSX.Element
}

export const EditorPerformerGroup = ({
  submit,
  categorySelector,
}: EditorPerformerGroupProps) => {
  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Group>({
    defaultValues: {
      name: '',
    },
  })

  const onSubmit: SubmitHandler<CopilotDocV1.Group> = (values) => {
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

        <EditorResetButton reset={reset} entityName="干员组" />
      </div>

      <FormField
        label="干员组名"
        field="name"
        control={control}
        error={errors.name}
        ControllerProps={{
          rules: { validate: (value) => !!value.trim() || '请输入干员组名' },
          render: ({ field }) => (
            <InputGroup
              large
              placeholder="任意名称，用于在动作中引用。例如：速狙、群奶"
              {...field}
            />
          ),
        }}
      />

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
