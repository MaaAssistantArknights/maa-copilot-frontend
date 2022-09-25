import { Button, Card, TextArea } from '@blueprintjs/core'
import { CardTitle } from 'components/CardTitle'
import {
  EditorActionExecPredicateCooling,
  EditorActionExecPredicateCostChange,
  EditorActionExecPredicateKills,
} from 'components/editor/action/EditorActionExecPredicate'
import { EditorActionOperatorDirection } from 'components/editor/action/EditorActionOperatorDirection'
import { EditorActionOperatorLocation } from 'components/editor/action/EditorActionOperatorLocation'
import { EditorActionTypeSelect } from 'components/editor/action/EditorActionTypeSelect'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { FormField, FormField2 } from 'components/FormField'
import { useEffect } from 'react'
import {
  Control,
  DeepPartial,
  FieldErrors,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form'
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
      <Card className="mb-8 pt-4">
        <div className="flex items-center mb-4">
          <CardTitle className="mb-0" icon="add">
            <span>添加动作</span>
          </CardTitle>

          <div className="flex-1" />

          <EditorResetButton
            reset={() => reset(defaultAction)}
            entityName="动作"
          />
        </div>

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
              label="干员名"
              description="选择干员或直接使用搜索内容创建干员"
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
                helperText: '键入干员名、拼音或拼音首字母以从干员列表中搜索',
              }}
            >
              <EditorOperatorName
                shouldUnregister
                control={control}
                name="name"
                rules={{
                  required:
                    (type === 'Deploy' || type === 'SkillUsage') &&
                    '必须填写干员',
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

        <FactItem title="通用属性" icon="properties" className="font-bold" />

        <div className="flex flex-wrap">
          <EditorActionExecPredicateKills control={control} />
          <EditorActionExecPredicateCostChange control={control} />
          <EditorActionExecPredicateCooling control={control} />
        </div>

        <div className="flex flex-wrap">
          <EditorActionPreDelay control={control} />
          <EditorActionRearDelay control={control} />
        </div>

        <div className="flex">
          <div className="w-full">
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
