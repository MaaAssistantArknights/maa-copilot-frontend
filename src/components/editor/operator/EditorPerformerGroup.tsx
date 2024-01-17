import { Button, Callout, InputGroup } from '@blueprintjs/core'

import { useEffect } from 'react'
import {
  FieldErrors,
  SubmitHandler,
  UseFormSetError,
  useForm,
} from 'react-hook-form'

import { CardTitle } from 'components/CardTitle'
import { FormField } from 'components/FormField'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { FactItem } from '../../FactItem'

export interface EditorPerformerGroupProps {
  group?: CopilotDocV1.Group
  submit: (
    group: CopilotDocV1.Group,
    setError: UseFormSetError<CopilotDocV1.Group>,
    fromSheet?: boolean,
  ) => boolean
  onCancel: () => void
  categorySelector: JSX.Element
}

export const EditorPerformerGroup = ({
  group,
  submit,
  onCancel,
  categorySelector,
}: EditorPerformerGroupProps) => {
  const isNew = !group

  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CopilotDocV1.Group>({
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    reset(group, { keepDefaultValues: true })
  }, [reset, group])

  const onSubmit: SubmitHandler<CopilotDocV1.Group> = (values) => {
    values.name = values.name.trim()

    if (submit(values, setError)) {
      reset()
    }
  }

  const globalError = (errors as FieldErrors<{ global: void }>).global?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center mb-4">
        <CardTitle className="mb-0" icon="add">
          {categorySelector}
        </CardTitle>

        <div className="flex-1" />

        <EditorResetButton reset={reset} entityName="正在编辑的干员组" />
      </div>

      <Callout className="mb-4">
        <FactItem
          dense
          icon="info-sign"
          title="什么是干员组？"
          className="font-bold"
        />
        <div>编队时将选择组内练度最高的一位干员；组内前后顺序并不影响判断</div>
      </Callout>

      <FormField
        label="干员组名"
        field="name"
        control={control}
        error={errors.name}
        description="任意名称，用于在动作中引用。例如：速狙、群奶"
        ControllerProps={{
          rules: { validate: (value) => !!value.trim() || '请输入干员组名' },
          render: ({ field }) => (
            <InputGroup large placeholder="干员组名" {...field} />
          ),
        }}
      />

      <div className="flex">
        <Button intent="primary" type="submit" icon={isNew ? 'add' : 'edit'}>
          {isNew ? '添加' : '保存'}
        </Button>

        {!isNew && (
          <Button icon="cross" className="ml-2" onClick={onCancel}>
            取消编辑
          </Button>
        )}
      </div>

      {globalError && (
        <Callout intent="danger" className="mt-2">
          {globalError}
        </Callout>
      )}
    </form>
  )
}
