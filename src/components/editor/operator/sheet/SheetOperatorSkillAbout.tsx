import { Button, Classes, H6, Icon, Text } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useForm } from 'react-hook-form'

import { FormField2 } from 'components/FormField'
import { DetailedSelectChoice } from 'components/editor/DetailedSelect'
import { CopilotDocV1 } from 'models/copilot.schema'
import { operatorSkillUsages } from 'models/operator'

import { EditorOperatorSkill } from '../EditorOperatorSkill'
import { EditorOperatorSkillTimes } from '../EditorOperatorSkillTimes'
import { EditorOperatorSkillUsage } from '../EditorOperatorSkillUsage'
import { Operator } from '../EditorSheet'
import { OperatorModifyProps } from './SheetOperator'

const needSkillTimeType = CopilotDocV1.SkillUsageType.ReadyToUseTimes

export interface SkillAboutProps {
  operator?: Operator
  onSkillChange?: OperatorModifyProps['operatorSkillHandle']
}

const skillDic = operatorSkillUsages as DetailedSelectChoice[]

export const SkillAboutTrigger = ({
  operator,
  onSkillChange,
}: SkillAboutProps) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Operator>({
    defaultValues: operator,
  })

  const skillUsage = watch('skillUsage')
  const needSkillTime = skillUsage === needSkillTimeType

  const SkillAboutForm = (
    <form
      onSubmit={handleSubmit(({ skill, skillTimes, skillUsage }) =>
        onSkillChange?.({
          ...operator!,
          ...{
            skill: skill || 1,
            skillUsage: skillUsage || 0,
            skillTimes: needSkillTime ? skillTimes || 1 : undefined,
          },
        }),
      )}
    >
      <div onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="flex flex-wrap">
          <FormField2
            label="技能"
            field="skill"
            error={errors.skill}
            className="mr-1"
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

        {needSkillTime && (
          <FormField2
            label="技能使用次数"
            field="skillTimes"
            error={errors.skillTimes}
          >
            <EditorOperatorSkillTimes control={control} name="skillTimes" />
          </FormField2>
        )}
      </div>
      <div className="flex items-center">
        <Button text="确定" type="submit" className={Classes.POPOVER_DISMISS} />
        <Tooltip2
          content='若不进行任何设置, 将使用默认值 (一技能 · 不自动使用 · 技能使用次数: 1次)'
          className="ml-1"
        >
          <Icon icon="help" />
        </Tooltip2>
      </div>
    </form>
  )
  const SkillAboutTrigger = (
    <Tooltip2 content="点击进行技能相关设置" disabled={!!operator}>
      <div
        className={clsx(
          'flex mt-3 text-gray-500 items-center text-xs',
          operator && 'hover:text-black',
        )}
      >
        <Icon icon="info-sign" size={12} className="flex items-center" />
        <p>
          {operator?.skill || '未设置'}技能{' '}
          {operator?.skillUsage !== undefined ? '·' : ''}
        </p>
        {operator?.skillUsage !== undefined && (
          <div className="relative">
            <Icon
              icon={
                skillDic.find((item) => item.value === operator?.skillUsage)
                  ?.icon
              }
              className="flex items-center ml-1"
              size={12}
            />
          </div>
        )}
        {!!operator?.skillTimes && <p> x{operator.skillTimes}</p>}
      </div>
    </Tooltip2>
  )

  return (
    <div
      onClick={(e) => {
        if (operator) e.stopPropagation()
      }}
      role="presentation"
    >
      <Popover2 content={SkillAboutForm} disabled={!operator}>
        {SkillAboutTrigger}
      </Popover2>
    </div>
  )
}
