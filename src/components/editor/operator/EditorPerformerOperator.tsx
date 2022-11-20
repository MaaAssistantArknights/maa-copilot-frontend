import { Button, Callout } from '@blueprintjs/core'

import { useEffect } from 'react'
import {
  FieldErrors,
  SubmitHandler,
  UseFormSetError,
  useForm,
} from 'react-hook-form'

import { CardTitle } from 'components/CardTitle'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { FormField2 } from '../../FormField'
import { EditorOperatorName } from './EditorOperator'
import { EditorOperatorGroupSelect } from './EditorOperatorGroupSelect'
import { EditorOperatorSkill } from './EditorOperatorSkill'
import { EditorOperatorSkillUsage } from './EditorOperatorSkillUsage'

export interface EditorOperatorFormValues extends CopilotDocV1.Operator {
  groupName?: string
}

export interface EditorPerformerOperatorProps {
  operator?: CopilotDocV1.Operator
  groups: CopilotDocV1.Group[]
  submit: (
    values: EditorOperatorFormValues,
    setError: UseFormSetError<EditorOperatorFormValues>,
  ) => boolean
  onCancel: () => void
  categorySelector: JSX.Element
}

export const EditorPerformerOperator = ({
  operator,
  groups,
  submit,
  onCancel,
  categorySelector,
}: EditorPerformerOperatorProps) => {
  const isNew = !operator

  const {
    control,
    reset,
    getValues,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditorOperatorFormValues>()

  const findGroupByOperator = (operator?: CopilotDocV1.Operator) =>
    operator &&
    groups.find((group) => group.opers?.find((op) => op._id === operator._id))

  // when the outside operator changes, reset the entire form
  useEffect(() => {
    reset(
      {
        ...operator,
        groupName: findGroupByOperator(operator)?.name,
      },
      { keepDefaultValues: true },
    )
  }, [reset, operator])

  // when groups change (meaning the operator's ownership may have changed from outside), update the groupName
  useEffect(() => {
    setValue('groupName', findGroupByOperator(getValues())?.name)
  }, [reset, getValues, groups])

  const onSubmit: SubmitHandler<EditorOperatorFormValues> = (values) => {
    values.name = values.name.trim()
    values.groupName = values.groupName?.trim()
    values.skill = values.skill ? values.skill : 1
    values.skillUsage = values.skillUsage ? values.skillUsage : 0
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

        <EditorResetButton<CopilotDocV1.Operator>
          reset={reset}
          entityName="正在编辑的干员"
        />
      </div>

      <FormField2
        label="干员名"
        description="选择干员或直接使用搜索内容创建干员"
        field="name"
        error={errors.name}
        asterisk
        FormGroupProps={{
          helperText: '键入干员名、拼音或拼音首字母以从干员列表中搜索',
        }}
      >
        <EditorOperatorName control={control} name="name" />
      </FormField2>

      <FormField2
        label="所属干员组"
        description="该干员的所属干员组，如果不存在则会自动创建"
        field="groupName"
        error={errors.groupName}
      >
        <EditorOperatorGroupSelect
          groups={groups}
          control={control}
          name="groupName"
        />
      </FormField2>

      <div className="flex flex-col lg:flex-row">
        <FormField2
          label="技能"
          field="skill"
          error={errors.skill}
          className="mr-2"
        >
          <EditorOperatorSkill control={control} name="skill" />
        </FormField2>

        <FormField2
          label="技能用法"
          field="skillUsage"
          error={errors.skillUsage}
        >
          <EditorOperatorSkillUsage control={control} name="skillUsage" />
        </FormField2>
      </div>

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
