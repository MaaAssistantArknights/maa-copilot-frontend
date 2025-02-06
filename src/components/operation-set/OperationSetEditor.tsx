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
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useOperations } from 'apis/operation'
import {
  createOperationSet,
  updateOperationSet,
  useRefreshOperationSet,
  useRefreshOperationSets,
} from 'apis/operation-set'
import clsx from 'clsx'
import { UpdateCopilotSetRequest } from 'maa-copilot-client'
import {
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Controller, UseFormSetError, useForm } from 'react-hook-form'

import { FormField } from 'components/FormField'
import { AppToaster } from 'components/Toaster'
import { Sortable } from 'components/dnd'
import { Operation } from 'models/operation'
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
    copilotIds,
  }) => {
    const updateInfo = async () => {
      if (isEdit) {
        const params: UpdateCopilotSetRequest['copilotSetUpdateReq'] = {
          id: operationSet!.id,
          name,
          description,
          status,
          copilotIds,
        }

        await updateOperationSet(params)

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

    await updateInfo()

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
  copilotIds?: number[]
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
        'p-4 w-[500px] max-w-[100vw] max-h-[calc(100vh-20rem)] min-h-[18rem] overflow-y-auto',
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
                    key={operationSet.id}
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
  getValues(): {
    copilotIds?: number[]
  }
}

function OperationSelector({
  operationSet,
  selectorRef,
}: OperationSelectorProps) {
  const { operations, error } = useOperations({
    operationIds: operationSet.copilotIds,
  })

  const [renderedOperations, setRenderedOperations] = useState<Operation[]>([])
  useEffect(() => {
    setRenderedOperations([...(operations ?? [])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations.length])

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
        const copilotIds: number[] = []
        copilotIds.push(
          ...renderedOperations
            .map(({ id }) => (checkboxOverrides[id] === false ? 0 : id))
            .filter((id) => !!id),
        )

        return { copilotIds }
      },
    }),
    [checkboxOverrides, renderedOperations],
  )

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setRenderedOperations((items) => {
        const oldIndex = items.findIndex((v) => v.id === active.id)
        const newIndex = items.findIndex((v) => v.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="py-2">
      {error && (
        <Callout intent="danger" icon="error" title="错误">
          {formatError(error)}
        </Callout>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={(renderedOperations ?? []).map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          {renderedOperations?.map(({ id, parsedContent }) => (
            <Sortable key={id} id={id}>
              {({ listeners, attributes }) => (
                <div
                  key={id}
                  className="flex items-center hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon
                    className="cursor-grab active:cursor-grabbing p-1 -my-1 -ml-2 -mr-1 rounded-[1px]"
                    icon="drag-handle-vertical"
                    {...listeners}
                    {...attributes}
                  />
                  <Checkbox
                    className={clsx(
                      'flex items-center m-0 p-2 !pl-10 flex-1',
                      checkboxOverrides[id] !== undefined &&
                        checkboxOverrides[id] !== alreadyAdded(id) &&
                        'font-bold',
                    )}
                    checked={checkboxOverrides[id] ?? alreadyAdded(id)}
                    onChange={(e) => {
                      const checked = (e.target as HTMLInputElement).checked
                      setCheckboxOverrides((prev) => ({
                        ...prev,
                        [id]: checked,
                      }))
                    }}
                  >
                    <div className="tabular-nums text-slate-500">
                      {id}:&nbsp;
                    </div>
                    <div className="truncate text-ellipsis">
                      {parsedContent.doc.title}
                    </div>
                  </Checkbox>
                </div>
              )}
            </Sortable>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
