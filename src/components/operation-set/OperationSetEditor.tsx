import {
  Button,
  Callout,
  Dialog,
  DialogProps,
  InputGroup,
  Switch,
  TextArea,
} from '@blueprintjs/core'

import { createOperationSet } from 'apis/operation-set'
import { useState } from 'react'
import { Controller, UseFormSetError, useForm } from 'react-hook-form'

import { FormField } from 'components/FormField'
import { AppToaster } from 'components/Toaster'
import { formatError } from 'utils/error'

interface OperationSetEditorDialogProps extends DialogProps {
  isOpen: boolean
  onClose: () => void
}

export function OperationSetEditorDialog({
  isOpen,
  onClose,
  ...props
}: OperationSetEditorDialogProps) {
  const onSubmit: FormProps['onSubmit'] = async (values) => {
    await createOperationSet({
      name: values.name,
      description: values.description,
      status: values.public ? 'PUBLIC' : 'PRIVATE',
      operationIds: [],
    })

    AppToaster.show({
      intent: 'success',
      message: `创建作业集成功`,
    })

    onClose()
  }

  return (
    <Dialog
      title="创建作业集"
      icon="applications"
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <OperationSetForm onSubmit={onSubmit} />
    </Dialog>
  )
}

interface FormProps {
  onSubmit: (
    values: FormValues,
    setError: UseFormSetError<FormValues>,
  ) => void | Promise<void>
}

interface FormValues {
  name: string
  description: string
  public: boolean
}

function OperationSetForm({ onSubmit }: FormProps) {
  const [globalError, setGlobalError] = useState<string>()

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      public: false,
    },
  })

  const localOnSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values, setError)
    } catch (e) {
      console.warn(e)
      setGlobalError(formatError(e))
    }
  })

  return (
    <form className="p-4" onSubmit={localOnSubmit}>
      <FormField
        label="标题"
        field="name"
        control={control}
        error={errors.name}
        ControllerProps={{
          rules: { required: '标题不能为空' },
          render: (renderProps) => (
            <InputGroup
              {...renderProps.field}
              value={renderProps.field.value || ''}
            />
          ),
        }}
      />

      <FormField
        label="描述"
        field="description"
        control={control}
        error={errors.description}
        ControllerProps={{
          render: (renderProps) => (
            <TextArea
              {...renderProps.field}
              value={renderProps.field.value || ''}
            />
          ),
        }}
      />

      <Controller
        name="public"
        control={control}
        render={({ field }) => (
          <Switch
            {...field}
            value={undefined}
            checked={field.value}
            label="对所有人可见"
          />
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button
          disabled={!isDirty || isSubmitting}
          intent="primary"
          loading={isSubmitting}
          type="submit"
          icon="floppy-disk"
        >
          提交
        </Button>
      </div>

      {globalError && (
        <Callout intent="danger" icon="error" title="错误">
          {globalError}
        </Callout>
      )}
    </form>
  )
}
