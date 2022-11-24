import { useEffect } from 'react'
import { get, useWatch } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { FormField2 } from '../../FormField'
import { EditorFieldProps } from '../EditorFieldProps'
import { useEditorForm } from '../utils/form'
import { EditorOperatorName } from './EditorOperator'
import { EditorOperatorSkill } from './EditorOperatorSkill'
import { EditorOperatorSkillUsage } from './EditorOperatorSkillUsage'

export interface EditorOperatorFormValues extends CopilotDocV1.Operator {}

export interface EditorOperatorFormProps
  extends EditorFieldProps<CopilotDocV1.Operation, CopilotDocV1.Operator> {}

export const EditorOperatorForm = ({ name }: EditorOperatorFormProps) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useEditorForm()

  const nameField = `${name}.name` as const
  const skillField = `${name}.skill` as const
  const skillUsageField = `${name}.skillUsage` as const

  const nameValue = useWatch({ control, name: nameField })

  useEffect(() => {
    trigger(nameField)
  }, [nameValue])

  return (
    <div>
      <FormField2
        label="干员名"
        description="选择干员或直接使用搜索内容创建干员"
        field={nameField}
        error={get(errors, nameField)}
        asterisk
        FormGroupProps={{
          helperText: '键入干员名、拼音或拼音首字母以从干员列表中搜索',
        }}
      >
        <EditorOperatorName control={control} name={nameField} />
      </FormField2>

      <div className="flex flex-wrap">
        <FormField2
          label="技能"
          field={skillField}
          error={get(errors, skillField)}
          className="mr-2"
        >
          <EditorOperatorSkill control={control} name={skillField} />
        </FormField2>

        <FormField2
          label="技能用法"
          field={skillUsageField}
          error={get(errors, skillUsageField)}
        >
          <EditorOperatorSkillUsage control={control} name={skillUsageField} />
        </FormField2>
      </div>
    </div>
  )
}
