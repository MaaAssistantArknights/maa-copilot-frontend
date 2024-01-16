import { Button, Callout, Card, TextArea } from '@blueprintjs/core'
import { DevTool } from '@hookform/devtools'

import { useEffect, useMemo } from 'react'
import {
  Control,
  DeepPartial,
  FieldErrors,
  UseFormSetError,
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
  EditorActionExecPredicateCosts,
  EditorActionExecPredicateKills,
} from 'components/editor/action/EditorActionExecPredicate'
import { EditorActionOperatorDirection } from 'components/editor/action/EditorActionOperatorDirection'
import { EditorActionOperatorLocation } from 'components/editor/action/EditorActionOperatorLocation'
import { EditorActionTypeSelect } from 'components/editor/action/EditorActionTypeSelect'
import { CopilotDocV1 } from 'models/copilot.schema'

import { useLevels } from '../../../apis/arknights'
import { findLevelByStageName } from '../../../models/level'
import { EditorOperatorName } from '../operator/EditorOperator'
import { EditorOperatorSkillTimes } from '../operator/EditorOperatorSkillTimes'
import { EditorOperatorSkillUsage } from '../operator/EditorOperatorSkillUsage'
import {
  EditorActionPreDelay,
  EditorActionRearDelay,
} from './EditorActionDelay'
import { EditorActionDistance } from './EditorActionDistance'
import { EditorActionModule } from './EditorActionModule'

export interface EditorActionAddProps {
  control: Control<CopilotDocV1.Operation>
  onSubmit: (
    action: CopilotDocV1.Action,
    setError: UseFormSetError<CopilotDocV1.Action>,
  ) => boolean
  onCancel: () => void
  editingAction?: CopilotDocV1.Action
}

const defaultAction: DeepPartial<CopilotDocV1.Action> = {
  type: CopilotDocV1.Type.Deploy,
}

const defaultMoveCameraAction: DeepPartial<CopilotDocV1.ActionMoveCamera> = {
  type: CopilotDocV1.Type.MoveCamera,
  distance: [4.5, 0],
}

export const EditorActionAdd = ({
  control: operationControl,
  editingAction,
  onSubmit: _onSubmit,
  onCancel,
}: EditorActionAddProps) => {
  const isNew = !editingAction
  const operatorGroups = useWatch({ control: operationControl, name: 'groups' })
  const operators = useWatch({ control: operationControl, name: 'opers' })

  const {
    control,
    reset,
    setError,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CopilotDocV1.Action>({
    defaultValues: defaultAction,
  })

  const type = useWatch({ control, name: 'type' })
  const stageName = useWatch({ control: operationControl, name: 'stageName' })
  const skillUsage = useWatch({ control, name: 'skillUsage' })

  const levels = useLevels().data?.data || []
  const level = useMemo(
    () => findLevelByStageName(levels, stageName),
    [levels, stageName],
  )

  const resettingValues: DeepPartial<CopilotDocV1.Action> = {
    ...defaultAction,
    // to prevent layout jumping, we persist the action type on reset
    type,
    ...(type === 'MoveCamera' ? defaultMoveCameraAction : null),
  }

  useEffect(() => {
    if (editingAction) {
      if ('type' in editingAction) {
        setValue('type', editingAction.type)
      }
      // 修复切换type的时候，数据丢失的问题
      // 原因：因为切换type的时候会触发页面绘制，导致form和对应的item组件丢失绑定，
      // 当重置时没办法正常清空item组件内部的值。
      // 放入setTimeout中，延迟赋值，就可以避免丢失绑定的问题
      setTimeout(() => {
        // 修复先点击“部署”动作的编辑按钮，再连续点击“二倍速”动作的编辑按钮，“部署”的数据丢失
        // 原因：通过reset方式赋值给form，相当于将action变量跟form绑定，
        // 当再通过reset(undefined)后，会将action的值置为null，
        // 通过setValue的方式，不会将action和form绑定
        if ('doc' in editingAction) {
          setValue('doc', editingAction.doc)
        }
        if ('docColor' in editingAction) {
          setValue('docColor', editingAction.docColor)
        }
        if ('costs' in editingAction) {
          setValue('costs', editingAction.costs)
        }
        if ('costChanges' in editingAction) {
          setValue('costChanges', editingAction.costChanges)
        }
        if ('kills' in editingAction) {
          setValue('kills', editingAction.kills)
        }
        if ('cooling' in editingAction) {
          setValue('cooling', editingAction.cooling)
        }
        if ('preDelay' in editingAction) {
          setValue('preDelay', editingAction.preDelay)
        }
        if ('rearDelay' in editingAction) {
          setValue('rearDelay', editingAction.rearDelay)
        }
        if ('name' in editingAction) {
          setValue('name', editingAction.name)
        }
        if ('direction' in editingAction) {
          setValue('direction', editingAction.direction)
        }
        if ('location' in editingAction) {
          setValue('location', editingAction.location)
        }
        if ('skillUsage' in editingAction) {
          setValue('skillUsage', editingAction.skillUsage)
        }
        if ('distance' in editingAction) {
          setValue('distance', editingAction.distance)
        }
      }, 0)
    } else {
      reset(resettingValues)
    }
  }, [editingAction])

  useEffect(() => {
    if (type === 'MoveCamera') {
      reset(resettingValues)
    }
  }, [type])

  useEffect(() => {
    setValue(
      'skillTimes',
      skillUsage === CopilotDocV1.SkillUsageType.ReadyToUseTimes
        ? (editingAction as CopilotDocV1.ActionSkillUsage)?.skillTimes ?? 1
        : undefined,
    )
  }, [skillUsage])

  const onSubmit = handleSubmit((values) => {
    if ('name' in values) {
      values.name = values.name?.trim()
    }
    if (!values.doc) {
      delete values.docColor
    }

    if (_onSubmit(values, setError)) {
      reset(resettingValues)
    }
  })

  const globalError = (errors as FieldErrors<{ global: void }>).global?.message

  return (
    <form onSubmit={onSubmit}>
      <Card className="mb-2 pb-8 pt-4 overflow-auto">
        <div className="flex items-center mb-4">
          <CardTitle className="mb-0" icon={isNew ? 'add' : 'edit'}>
            <span>{isNew ? '添加' : '编辑'}动作</span>
          </CardTitle>

          <div className="flex-1" />

          <EditorResetButton
            reset={() => reset(resettingValues)}
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
          type === 'SkillUsage' ||
          type === 'BulletTime') && (
          <div className="flex">
            <FormField2<
              | CopilotDocV1.ActionDeploy
              | CopilotDocV1.ActionSkillOrRetreatOrBulletTime
            >
              label="干员或干员组名"
              description="选择干员、使用干员名、或使用干员组名引用"
              field="name"
              error={
                (
                  errors as FieldErrors<
                    | CopilotDocV1.ActionDeploy
                    | CopilotDocV1.ActionSkillOrRetreatOrBulletTime
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
                groups={operatorGroups}
                operators={operators}
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

        {(type === 'Deploy' ||
          type === 'Skill' ||
          type === 'Retreat' ||
          type === 'BulletTime') && (
          <div className="flex">
            <EditorActionOperatorLocation
              shouldUnregister
              actionType={type}
              level={level}
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
          <div className="flex gap-2">
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

            {skillUsage === CopilotDocV1.SkillUsageType.ReadyToUseTimes && (
              <FormField2
                label="技能使用次数"
                field="skillTimes"
                error={
                  (errors as FieldErrors<CopilotDocV1.ActionSkillUsage>)
                    .skillTimes
                }
              >
                <EditorOperatorSkillTimes
                  control={control as Control<CopilotDocV1.ActionSkillUsage>}
                  name="skillTimes"
                />
              </FormField2>
            )}
          </div>
        )}

        {type === 'MoveCamera' && (
          <>
            <Callout>
              移动距离一般不需要修改，只填写前置延迟（15000）和击杀数条件即可
            </Callout>
            <div className="flex mt-2">
              <EditorActionDistance
                shouldUnregister
                control={control}
                name="distance"
              />
            </div>
          </>
        )}

        <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

        <EditorActionModule
          title="执行条件"
          icon="stopwatch"
          className="font-bold"
        >
          <div className="flex flex-wrap">
            <EditorActionExecPredicateKills control={control} />
            <EditorActionExecPredicateCooling control={control} />
          </div>
          <div className="flex flex-wrap">
            <EditorActionExecPredicateCosts control={control} />
            <EditorActionExecPredicateCostChange control={control} />
          </div>
          <div className="flex flex-wrap">
            <EditorActionPreDelay control={control} />
            <EditorActionRearDelay control={control} />
          </div>
        </EditorActionModule>
        <div className="h-px w-full bg-gray-200 mt-4 mb-6" />

        <EditorActionModule
          title="日志"
          icon="annotation"
          className="font-bold"
        >
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
                    value={field.value || ''}
                  />
                ),
              }}
            />
          </div>
        </EditorActionModule>

        <div className="mt-4 flex">
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
      </Card>
    </form>
  )
}
