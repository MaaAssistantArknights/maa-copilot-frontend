import { Button, Classes, Icon } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useMemo } from 'react'
import { UseFormSetError, useForm } from 'react-hook-form'

import { FormField2 } from 'components/FormField'
import { DetailedSelectChoice } from 'components/editor/DetailedSelect'
import { CopilotDocV1 } from 'models/copilot.schema'
import { operatorSkillUsages } from 'models/operator'

import { EditorOperatorSkill } from '../EditorOperatorSkill'
import { EditorOperatorSkillTimes } from '../EditorOperatorSkillTimes'
import { EditorOperatorSkillUsage } from '../EditorOperatorSkillUsage'
import { Operator } from '../EditorSheet'

export type EventType = 'box' | 'pin' | 'skill'
const needSkillTimeType = CopilotDocV1.SkillUsageType.ReadyToUseTimes

export interface SkillAboutProps {
  operator?: CopilotDocV1.Operator
  submitOperator?: (
    type: EventType,
    value: CopilotDocV1.Operator,
    setError?: UseFormSetError<CopilotDocV1.Operator>,
  ) => void
}

export const SkillAboutTrigger = ({
  operator,
  submitOperator,
}: SkillAboutProps) => {
  const skillDic = useMemo(() => {
    return ([...operatorSkillUsages] as DetailedSelectChoice[]).map((item) => ({
      value: item.value,
      icon: item.icon,
    }))
  }, [])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Operator>({
    defaultValues: operator,
  })

  const skillUsage = watch('skillUsage')
  const needSkillTime = useMemo(
    () => skillUsage === needSkillTimeType,
    [skillUsage],
  )

  const submitHandle = ({ skill, skillTimes, skillUsage }: Operator) => {
    console.log(needSkillTime ? skillTimes || 1 : undefined)
    submitOperator!('skill', {
      ...operator!,
      ...{
        skill: skill || 1,
        skillUsage: skillUsage || 0,
        skillTimes: needSkillTime ? skillTimes || 1 : undefined,
      },
    })
  }

  const SkillHelp = useMemo(
    () => (
      <Tooltip2
        content={
          <div className="ml-1 flex">
            <p className="text-xs">若不进行任何设置，将使用默认值:</p>
            <div className="mx-1 text-xs font-bold">
              <p>一技能</p>
              <p>不自动使用</p>
              <p>技能使用次数: 1次</p>
            </div>
          </div>
        }
        className="ml-1"
      >
        <Icon icon="help" />
      </Tooltip2>
    ),
    [],
  )
  const SkillAboutForm = (
    <form onSubmit={handleSubmit((value) => submitHandle(value))}>
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
        {SkillHelp}
      </div>
    </form>
  )
  const SkillAboutTrigger = useMemo(
    () => (
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
    ),
    [operator],
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
