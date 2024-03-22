import {
  Button,
  Callout,
  Checkbox,
  Dialog,
  DialogProps,
  InputGroup,
  TextArea,
} from '@blueprintjs/core'

import { createOperationSet, updateOperationSet } from 'apis/operation-set'
import { useState } from 'react'
import { Controller, UseFormSetError, useForm } from 'react-hook-form'

import { FormField } from 'components/FormField'
import { AppToaster } from 'components/Toaster'
import { OperationSet } from 'models/operation-set'
import { formatError } from 'utils/error'

interface OperationSetEditorDialogProps extends DialogProps {
  operationSet?: OperationSet
  isOpen: boolean
  onClose: () => void
}

export function OperationSetEditorDialog({
  isOpen,
  onClose,
  operationSet,
  ...props
}: OperationSetEditorDialogProps) {
  const isEdit = !!operationSet

  const onSubmit: FormProps['onSubmit'] = async (values) => {
    if (isEdit) {
      await updateOperationSet({
        id: operationSet!.id,
        name: values.name,
        description: values.description,
        status: values.status,
      })

      AppToaster.show({
        intent: 'success',
        message: `更新作业集成功`,
      })
    } else {
      await createOperationSet({
        name: values.name,
        description: values.description,
        status: values.status,
        operationIds: [],
      })

      AppToaster.show({
        intent: 'success',
        message: `创建作业集成功`,
      })
    }

    onClose()
  }

  return (
    <Dialog
      title={isEdit ? '编辑作业集' : '创建作业集'}
      icon="applications"
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <OperationSetForm operationSet={operationSet} onSubmit={onSubmit} />
    </Dialog>
  )
}

interface FormProps {
  operationSet?: OperationSet
  onSubmit: (
    values: FormValues,
    setError: UseFormSetError<FormValues>,
  ) => void | Promise<void>
}

interface FormValues {
  name: string
  description: string
  status: 'PUBLIC' | 'PRIVATE'
}

function OperationSetForm({ operationSet, onSubmit }: FormProps) {
  const [globalError, setGlobalError] = useState<string>()

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: operationSet || {
      name: '',
      description: '',
      status: 'PRIVATE',
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
        name="status"
        control={control}
        render={({ field }) => (
          <Checkbox
            {...field}
            value={undefined}
            checked={field.value === 'PUBLIC'}
            onChange={(e) =>
              field.onChange(
                (e.target as HTMLInputElement).checked ? 'PUBLIC' : 'PRIVATE',
              )
            }
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
