import {
  Button,
  Callout,
  Checkbox,
  Dialog,
  DialogProps,
  Icon,
  InputGroup,
  NonIdealState,
  TextArea,
} from '@blueprintjs/core'

import { useOperations } from 'apis/operation'
import {
  addToOperationSet,
  createOperationSet,
  removeFromOperationSet,
  updateOperationSet,
  useRefreshOperationSet,
  useRefreshOperationSets,
} from 'apis/operation-set'
import clsx from 'clsx'
import { Ref, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Controller, UseFormSetError, useForm } from 'react-hook-form'

import { FormField } from 'components/FormField'
import { AppToaster } from 'components/Toaster'
import { OperationSet } from 'models/operation-set'
import { formatError } from 'utils/error'

export function OperationSetEditorLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button large fill icon="folder-close" onClick={() => setIsOpen(true)}>
        创建作业集
      </Button>
      <OperationSetEditorDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

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

  const refreshOperationSets = useRefreshOperationSets()
  const refreshOperationSet = useRefreshOperationSet()

  const onSubmit: FormProps['onSubmit'] = async ({
    name,
    description,
    status,
    idsToAdd,
    idsToRemove,
  }) => {
    const updateInfo = async () => {
      if (isEdit) {
        await updateOperationSet({
          id: operationSet!.id,
          name,
          description,
          status,
        })

        AppToaster.show({
          intent: 'success',
          message: `更新作业集成功`,
        })
      } else {
        await createOperationSet({
          name,
          description,
          status,
          operationIds: [],
        })

        AppToaster.show({
          intent: 'success',
          message: `创建作业集成功`,
        })
      }

      refreshOperationSets()

      if (operationSet) {
        refreshOperationSet(operationSet.id)
      }
    }

    const addOperations = async () => {
      if (operationSet && idsToAdd?.length) {
        await addToOperationSet({
          operationSetId: operationSet.id,
          operationIds: idsToAdd,
        })

        AppToaster.show({
          intent: 'success',
          message: `添加作业成功`,
        })
      }
    }

    const removeOperations = async () => {
      if (operationSet && idsToRemove?.length) {
        await removeFromOperationSet({
          operationSetId: operationSet.id,
          operationIds: idsToRemove,
        })

        AppToaster.show({
          intent: 'success',
          message: `移除作业成功`,
        })
      }
    }

    await Promise.all([updateInfo(), addOperations(), removeOperations()])

    onClose()
  }

  return (
    <Dialog
      title={isEdit ? '编辑作业集' : '创建作业集'}
      icon="folder-close"
      className="w-auto"
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <OperationSetForm
        key={operationSet?.id}
        operationSet={operationSet}
        onSubmit={onSubmit}
      />
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

  idsToAdd?: number[]
  idsToRemove?: number[]
}

function OperationSetForm({ operationSet, onSubmit }: FormProps) {
  const isEdit = !!operationSet

  const operationSelectorRef = useRef<OperationSelectorRef>(null)
  const [globalError, setGlobalError] = useState<string>()

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: operationSet || {
      name: '',
      description: '',
      status: 'PRIVATE',
    },
  })

  const localOnSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(
        {
          ...values,
          ...operationSelectorRef.current?.getValues(),
        },
        setError,
      )
    } catch (e) {
      console.warn(e)
      setGlobalError(formatError(e))
    }
  })

  return (
    <form
      className={clsx(
        'p-4 w-[500px] max-w-[100vw] max-h-[calc(100vh-20rem)] overflow-y-auto',
        isEdit && 'lg:w-[1000px]',
      )}
      onSubmit={localOnSubmit}
    >
      <div className="gap-4 flex flex-wrap-reverse lg:flex-nowrap">
        {isEdit && (
          <div className="grow basis-full flex flex-col border-t lg:border-t-0 lg:border-r border-slate-200">
            {operationSet.copilotIds.length > 0 ? (
              <>
                <div className="grow">
                  <OperationSelector
                    operationSet={operationSet}
                    selectorRef={operationSelectorRef}
                  />
                </div>
              </>
            ) : (
              <NonIdealState
                className="grow"
                icon="helicopter"
                description={
                  <>
                    还没有添加作业哦(￣▽￣)
                    <br />
                    请从作业列表中添加
                  </>
                }
              />
            )}
          </div>
        )}

        <div className="grow basis-full">
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
                    (e.target as HTMLInputElement).checked
                      ? 'PUBLIC'
                      : 'PRIVATE',
                  )
                }
                label="对所有人可见"
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6 flex items-end">
        {isEdit && (
          <div className="text-xs text-gray-500">
            <Icon icon="info-sign" /> 修改后请点击保存按钮
          </div>
        )}

        <Button
          disabled={isSubmitting}
          intent="primary"
          loading={isSubmitting}
          type="submit"
          icon="floppy-disk"
          className="ml-auto"
        >
          {isEdit ? '保存' : '创建'}
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

interface OperationSelectorProps {
  operationSet: OperationSet

  // 这个组件做成受控组件的话，输入输出比较难处理，所以做成非受控组件，用 ref 获取值
  selectorRef: Ref<OperationSelectorRef>
}

interface OperationSelectorRef {
  getValues(): { idsToAdd: number[]; idsToRemove: number[] }
}

function OperationSelector({
  operationSet,
  selectorRef,
}: OperationSelectorProps) {
  const { operations, error } = useOperations({
    operationIds: operationSet.copilotIds,
  })

  const [checkboxOverrides, setCheckboxOverrides] = useState(
    {} as Record<number, boolean>,
  )

  const alreadyAdded = useCallback(
    (operationId: number) => operationSet.copilotIds.includes(operationId),
    [operationSet.copilotIds],
  )

  useImperativeHandle(
    selectorRef,
    () => ({
      getValues() {
        const idsToAdd: number[] = []
        const idsToRemove: number[] = []

        Object.entries(checkboxOverrides).forEach(([idKey, checked]) => {
          const id = +idKey
          if (isNaN(id)) return

          if (checked && !alreadyAdded(id)) {
            idsToAdd.push(id)
          } else if (!checked && alreadyAdded(id)) {
            idsToRemove.push(id)
          }
        })

        return { idsToAdd, idsToRemove }
      },
    }),
    [checkboxOverrides, alreadyAdded],
  )

  return (
    <div className="py-2">
      {error && (
        <Callout intent="danger" icon="error" title="错误">
          {formatError(error)}
        </Callout>
      )}

      {operations?.map(({ id, parsedContent }) => (
        <div key={id}>
          <Checkbox
            className={clsx(
              'flex items-center m-0 p-2 !pl-10 hover:bg-slate-200',
              checkboxOverrides[id] !== undefined &&
                checkboxOverrides[id] !== alreadyAdded(id) &&
                'font-bold',
            )}
            checked={checkboxOverrides[id] ?? alreadyAdded(id)}
            onChange={(e) => {
              const checked = (e.target as HTMLInputElement).checked
              setCheckboxOverrides((prev) => ({ ...prev, [id]: checked }))
            }}
          >
            <div className="tabular-nums text-slate-500">{id}:&nbsp;</div>
            <div className="truncate text-ellipsis">
              {parsedContent.doc.title}
            </div>
          </Checkbox>
        </div>
      ))}
    </div>
  )
}
