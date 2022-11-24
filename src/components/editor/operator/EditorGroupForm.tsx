import { InputGroup } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { uniqueId } from 'lodash-es'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { FormField } from 'components/FormField'
import type { CopilotDocV1 } from 'models/copilot.schema'

import {
  FieldErrorsWithGlobal,
  UseFormSetErrorWithGlobal,
} from '../../../types'
import { Sortable } from '../../dnd'
import { isFormValuesDirty } from '../utils/form'
import { EditorOperatorItem } from './EditorOperatorItem'

export interface EditorGroupFormValues extends CopilotDocV1.Group {}

export interface EditorGroupFormProps {
  group: Partial<CopilotDocV1.Group>
  onChange?: (
    values: EditorGroupFormValues,
    setError: UseFormSetErrorWithGlobal<EditorGroupFormValues>,
  ) => void
  onError?: (errors: FieldErrorsWithGlobal<EditorGroupFormValues>) => void
}

const getOperatorId = (operator: CopilotDocV1.Operator) =>
  (operator._id ??= uniqueId())

export const EditorGroupForm = ({
  group,
  onChange,
  onError,
}: EditorGroupFormProps) => {
  const sensors = useSensors(useSensor(PointerSensor))

  const {
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditorGroupFormValues>({
    defaultValues: group,
  })

  const {
    fields: operators,
    insert: insertOperator,
    move: moveOperator,
    update: updateOperator,
    remove: removeOperator,
  } = useFieldArray({
    name: 'opers',
    control,
  })

  const values = watch()

  useEffect(() => {
    reset(group)
  }, [reset, group])

  useEffect(() => {
    values.name = values.name?.trim()

    if (!isFormValuesDirty(values, group)) {
      onChange?.(
        values,
        setError as UseFormSetErrorWithGlobal<EditorGroupFormValues>,
      )
    }
  }, [onChange, values, group])

  useEffect(() => {
    onError?.(errors)
  }, [onError, errors])

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const oldIndex = operators.findIndex(
      (op) => getOperatorId(op) === active.id,
    )
    const newIndex = operators.findIndex((op) => getOperatorId(op) === over?.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      moveOperator(oldIndex, newIndex)
    }
  }

  return (
    <div>
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={operators.map(getOperatorId) || []}
          strategy={verticalListSortingStrategy}
        >
          {operators.map((operator, i) => (
            <Sortable
              className="mb-2"
              key={getOperatorId(operator)}
              id={getOperatorId(operator)}
              data={{ type: 'operator' }}
            >
              {(attrs) => (
                <EditorOperatorItem
                  operator={operator}
                  onChange={(data) => updateOperator(i, data)}
                  onRemove={() => removeOperator(i)}
                  {...attrs}
                />
              )}
            </Sortable>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
