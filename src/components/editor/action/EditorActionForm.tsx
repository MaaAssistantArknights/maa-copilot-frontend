import { TextArea } from '@blueprintjs/core'

import { FieldErrors, useWatch } from 'react-hook-form'

import { FormField, FormField2 } from 'components/FormField'
import { EditorActionDocColor } from 'components/editor/action/EditorActionDocColor'
import {
  EditorActionExecPredicateCooling,
  EditorActionExecPredicateCostChange,
  EditorActionExecPredicateKills,
} from 'components/editor/action/EditorActionExecPredicate'
import { EditorActionOperatorDirection } from 'components/editor/action/EditorActionOperatorDirection'
import { EditorActionOperatorLocation } from 'components/editor/action/EditorActionOperatorLocation'
import { EditorActionTypeSelect } from 'components/editor/action/EditorActionTypeSelect'
import { CopilotDocV1 } from 'models/copilot.schema'

import { FactItem } from '../../FactItem'
import { EditorFieldProps } from '../EditorFieldProps'
import { EditorOperatorName } from '../operator/EditorOperator'
import { EditorOperatorSkillUsage } from '../operator/EditorOperatorSkillUsage'
import { defaultAction } from '../utils/defaults'
import { useEditorForm } from '../utils/form'
import {
  EditorActionPreDelay,
  EditorActionRearDelay,
} from './EditorActionDelay'

export type EditorActionFormValues = CopilotDocV1.Action

export interface EditorActionFormProps
  extends EditorFieldProps<CopilotDocV1.Operation, CopilotDocV1.Action> {}

export const EditorActionForm = ({ name }: EditorActionFormProps) => {
  const { control } = useEditorForm()
  const action = useWatch({
    control,
    name,
    defaultValue: defaultAction,
  })

  const operatorGroups = useWatch({ control, name: 'groups' })

  const { type } = action

  const typeField = `${name}.type` as const
  const nameField = `${name}.name` as const
  const locationField = `${name}.location` as const
  const directionField = `${name}.direction` as const
  const skillUsageField = `${name}.skillUsage` as const
  const killsField = `${name}.kills` as const
  const costChangesField = `${name}.costChanges` as const
  const coolingField = `${name}.cooling` as const
  const preDelayField = `${name}.preDelay` as const
  const rearDelayField = `${name}.rearDelay` as const

  return (
    <div>
      <FormField2 label="动作类型" field="type" error={errors.type} asterisk>
        <EditorActionTypeSelect control={control} name="type" />
      </FormField2>

      {(type === 'Deploy' ||
        type === 'Skill' ||
        type === 'Retreat' ||
        type === 'SkillUsage') && (
        <FormField2<
          CopilotDocV1.ActionDeploy | CopilotDocV1.ActionSkillOrRetreat
        >
          label="干员或干员组名"
          description="选择干员、使用干员名、或使用干员组名引用"
          field="name"
          error={
            (
              errors as FieldErrors<
                CopilotDocV1.ActionDeploy | CopilotDocV1.ActionSkillOrRetreat
              >
            ).name
          }
          asterisk={type === 'Deploy'}
          FormGroupProps={{
            helperText: (
              <>
                <p>键入干员名、拼音或拼音首字母以搜索干员列表</p>
                <p>键入干员组名以引用干员组配置</p>
              </>
            ),
          }}
        >
          <EditorOperatorName
            groups={operatorGroups}
            control={control}
            name="name"
            rules={{
              required:
                (type === 'Deploy' || type === 'SkillUsage') &&
                '必须填写干员或干员组名',
            }}
          />
        </FormField2>
      )}

      {(type === 'Deploy' || type === 'Skill' || type === 'Retreat') && (
        <EditorActionOperatorLocation
          actionType={type}
          control={control}
          name="location"
        />
      )}

      {type === 'Deploy' && (
        <EditorActionOperatorDirection control={control} name="direction" />
      )}

      {type === 'SkillUsage' && (
        <FormField2
          label="技能用法"
          field="skillUsage"
          error={
            (errors as FieldErrors<CopilotDocV1.ActionSkillUsage>).skillUsage
          }
        >
          <EditorOperatorSkillUsage name="skillUsage" defaultValue={0} />
        </FormField2>
      )}

      <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

      <FactItem title="执行条件" icon="stopwatch" className="font-bold" />

      <div className="flex flex-wrap">
        <EditorActionExecPredicateKills control={control} name={killsField} />
        <EditorActionExecPredicateCostChange
          control={control}
          name={costChangesField}
        />
        <EditorActionExecPredicateCooling
          control={control}
          name={coolingField}
        />
      </div>

      <div className="flex flex-wrap">
        <EditorActionPreDelay control={control} />
        <EditorActionRearDelay control={control} />
      </div>

      <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

      <FactItem title="日志" icon="annotation" className="font-bold" />

      <div className="flex flex-col w-full">
        <EditorActionDocColor control={control} name="docColor" />

        <FormField
          label="描述"
          field="doc"
          control={control}
          ControllerProps={{
            render: ({ field }) => (
              <TextArea
                fill
                rows={2}
                growVertically
                large
                id="doc"
                placeholder="描述，可选。会显示在界面上，没有实际作用"
                {...field}
                value={field.value || ''}
              />
            ),
          }}
        />
      </div>
    </div>
  )
}
