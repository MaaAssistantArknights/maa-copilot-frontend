import { Button, Classes, Icon, MenuItem } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { Select2 } from '@blueprintjs/select'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { UseFormSetError } from 'react-hook-form'

import {
  DetailedSelect,
  DetailedSelectChoice,
  DetailedSelectItem,
} from 'components/editor/DetailedSelect'
import { Operator } from 'models/arknights'
import { CopilotDocV1 } from 'models/copilot.schema'
import { operatorSkillUsages, operatorSkills } from 'models/operator'

export type EventType = 'box' | 'pin' | 'skill'

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
  const [skill, setSkill] = useState<number>(operator?.skill || 1)
  const [skillUsage, setSkillUsage] = useState<CopilotDocV1.SkillUsageType>(
    operator?.skillUsage || 0,
  )
  const submitHandle = () => {
    const operatorCopy = { ...operator }
    operatorCopy.skill = skill
    operatorCopy.skillUsage = skillUsage
    submitOperator!('skill', operatorCopy as Operator)
  }

  const resetData = () => {
    setSkill(operator?.skill || 1)
    setSkillUsage(operator?.skillUsage || 0)
  }

  const selectedSkillUsage = useMemo(
    () => operatorSkillUsages[skillUsage],
    [skillUsage],
  ) as DetailedSelectChoice

  const selectedSkill = useMemo(() => operatorSkills[skill - 1], [skill])

  const SkillUsageDetailSelect = useMemo(
    () => (
      <DetailedSelect
        items={operatorSkillUsages as DetailedSelectItem[]}
        onItemSelect={(item) => setSkillUsage(item.value as 0 | 1 | 2 | 3)}
        activeItem={selectedSkillUsage}
      >
        <Button
          icon={selectedSkillUsage?.icon || 'slash'}
          text={selectedSkillUsage ? selectedSkillUsage.title : '选择技能用法'}
          rightIcon="double-caret-vertical"
        />
      </DetailedSelect>
    ),
    [skillUsage],
  )
  const SkillDetailSelect = useMemo(
    () => (
      <Select2
        filterable={false}
        items={[...operatorSkills]}
        itemRenderer={(action, { handleClick, handleFocus, modifiers }) => (
          <MenuItem
            selected={modifiers.active}
            key={action.value}
            onClick={handleClick}
            onFocus={handleFocus}
            icon={action.icon}
            text={action.title}
          />
        )}
        onItemSelect={(item) => setSkill(item.value || 1)}
      >
        <Button
          icon={selectedSkill.icon}
          text={selectedSkill.title}
          rightIcon="double-caret-vertical"
        />
      </Select2>
    ),
    [skill],
  )

  const skillAboutForm = (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        role="presentation"
        className="flex items-center mb-3"
      >
        <div>
          <p className="mb-1">技能</p>
          {SkillDetailSelect}
        </div>
        <div className="ml-3">
          <p className="mb-1">技能用法</p>
          {SkillUsageDetailSelect}
        </div>
      </div>
      <Button
        text="确认"
        onClick={submitHandle}
        className={Classes.POPOVER_DISMISS}
      />
    </>
  )
  const skillAboutTrigger = useMemo(
    () => (
      <Tooltip2
        content="点击进行技能相关设置"
        disabled={operator ? false : true}
      >
        <div
          className={clsx(
            'flex mt-3 text-gray-500',
            operator && 'hover:text-black',
          )}
        >
          <Icon icon="info-sign" size={12} className="flex items-center" />
          <p className="text-xs">{`${operator?.skill || '未设置'}技能 ${
            operator?.skillUsage !== undefined ? '·' : ''
          } `}</p>
          {operator?.skillUsage !== undefined && (
            <Icon
              icon={
                skillDic.find((item) => item.value === operator?.skillUsage)
                  ?.icon
              }
              className="flex items-center ml-1"
            />
          )}
        </div>
      </Tooltip2>
    ),
    [operator, skill, skillUsage],
  )

  return (
    <div
      onClick={(e) => {
        if (operator) e.stopPropagation()
      }}
      role="presentation"
    >
      <Popover2
        content={skillAboutForm}
        disabled={operator ? false : true}
        onClosed={resetData}
      >
        {skillAboutTrigger}
      </Popover2>
    </div>
  )
}
