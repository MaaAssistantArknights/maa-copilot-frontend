import { Button, Card, TextArea } from '@blueprintjs/core'
import { DevTool } from '@hookform/devtools'

import { useEffect } from 'react'
import {
  Control,
  DeepPartial,
  FieldErrors,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form'

import { CardTitle } from 'components/CardTitle'
import { FormField, FormField2 } from 'components/FormField'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { EditorActionDocColor } from 'components/editor/action/EditorActionDocColor'
import {
  EditorActionExecPredicateCooling,
  EditorActionExecPredicateCostChange,
  EditorActionExecPredicateKills,
} from 'components/editor/action/EditorActionExecPredicate'
import { EditorActionOperatorDirection } from 'components/editor/action/EditorActionOperatorDirection'
import { EditorActionOperatorLocation } from 'components/editor/action/EditorActionOperatorLocation'
import { EditorActionTypeSelect } from 'components/editor/action/EditorActionTypeSelect'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { FactItem } from '../../FactItem'
import { EditorOperatorName } from '../operator/EditorOperator'
import { EditorOperatorSkillUsage } from '../operator/EditorOperatorSkillUsage'
import {
  EditorActionPreDelay,
  EditorActionRearDelay,
} from './EditorActionDelay'
import { validateAction } from './validation'

export interface EditorActionAddProps {
  onSubmit: (action: CopilotDocV1.Action) => void
  onCancel: () => void
  action?: CopilotDocV1.Action
}

const defaultAction: DeepPartial<CopilotDocV1.Action> = {
  type: 'Deploy' as CopilotDocV1.Type.Deploy,
}

export const EditorActionAdd = ({
  action,
  onSubmit: _onSubmit,
  onCancel,
}: EditorActionAddProps) => {
  const isNew = !action

  const {
    control,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<CopilotDocV1.Action>({
    defaultValues: defaultAction,
  })

  useEffect(() => {
    if (action) {
      reset(action)
    }
  }, [action])

  const onSubmit: SubmitHandler<CopilotDocV1.Action> = (values) => {
    if (validateAction(values, setError)) {
      _onSubmit(values)
    }
  }

  const type = useWatch({ control, name: 'type' })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-2 pt-4">
        <div className="flex items-center mb-4">
          <CardTitle className="mb-0" icon={isNew ? 'add' : 'edit'}>
            <span>{isNew ? '添加' : '编辑'}动作</span>
          </CardTitle>

          <div className="flex-1" />

          <EditorResetButton
            reset={() => reset(defaultAction)}
            entityName="正在编辑的动作"
          />
        </div>

        {import.meta.env.DEV && <DevTool control={control} />}

        <div className="flex flex-col lg:flex-row">
          <div className="flex flex-1">
            <FormField2
              label="动作类型"
              field="type"
              error={errors.type}
              asterisk
            >
              <EditorActionTypeSelect control={control} name="type" />
            </FormField2>
          </div>
        </div>

        {(type === 'Deploy' ||
          type === 'Skill' ||
          type === 'Retreat' ||
          type === 'SkillUsage') && (
          <div className="flex">
            <FormField2<
              CopilotDocV1.ActionDeploy | CopilotDocV1.ActionSkillOrRetreat
            >
              label="干员或干员组名"
              description="选择干员、使用干员名、或使用干员组名引用"
              field="name"
              error={
                (
                  errors as FieldErrors<
                    | CopilotDocV1.ActionDeploy
                    | CopilotDocV1.ActionSkillOrRetreat
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
                shouldUnregister
                allowOperatorGroups
                control={control}
                name="name"
                rules={{
                  required:
                    (type === 'Deploy' || type === 'SkillUsage') &&
                    '必须填写干员或干员组名',
                }}
              />
            </FormField2>
          </div>
        )}

        {(type === 'Deploy' || type === 'Skill' || type === 'Retreat') && (
          <div className="flex">
            <EditorActionOperatorLocation
              shouldUnregister
              actionType={type}
              control={control}
              name="location"
            />
          </div>
        )}

        {type === 'Deploy' && (
          <div className="flex">
            <EditorActionOperatorDirection
              shouldUnregister
              control={control}
              name="direction"
            />
          </div>
        )}

        {type === 'SkillUsage' && (
          <div className="flex">
            <FormField2
              label="技能用法"
              field="skillUsage"
              error={
                (errors as FieldErrors<CopilotDocV1.ActionSkillUsage>)
                  .skillUsage
              }
            >
              <EditorOperatorSkillUsage
                shouldUnregister
                control={control as Control<CopilotDocV1.ActionSkillUsage>}
                name="skillUsage"
                defaultValue={0}
              />
            </FormField2>
          </div>
        )}

        <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

        <FactItem title="执行条件" icon="stopwatch" className="font-bold" />

        <div className="flex flex-wrap">
          <EditorActionExecPredicateKills control={control} />
          <EditorActionExecPredicateCostChange control={control} />
          <EditorActionExecPredicateCooling control={control} />
        </div>

        <div className="flex flex-wrap">
          <EditorActionPreDelay control={control} />
          <EditorActionRearDelay control={control} />
        </div>

        <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

        <FactItem title="日志" icon="annotation" className="font-bold" />

        <div className="flex flex-col w-full">
          <EditorActionDocColor
            shouldUnregister
            control={control}
            name="docColor"
          />

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
                />
              ),
            }}
          />
        </div>

        <div className="mt-4 flex items-start">
          <Button intent="primary" type="submit" icon={isNew ? 'add' : 'edit'}>
            {isNew ? '添加' : '保存'}
          </Button>

          {!isNew && (
            <Button icon="cross" className="ml-2" onClick={onCancel}>
              取消编辑
            </Button>
          )}
        </div>
      </Card>
    </form>
  )
}
