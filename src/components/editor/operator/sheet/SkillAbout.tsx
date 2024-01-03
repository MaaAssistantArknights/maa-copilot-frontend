import { Button, Icon } from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'

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
import { operatorSkillUsages } from 'models/operator'

export type EventType = 'box' | 'pin' | 'skill'

export interface SkillAboutProps {
  operator?: CopilotDocV1.Operator
  submitOperator: (
    type: EventType,
    value: CopilotDocV1.Operator,
    setError?: UseFormSetError<CopilotDocV1.Operator>,
  ) => void
}

const SkillAboutForm = ({ operator, submitOperator }: SkillAboutProps) => {
  const selectedAction = useMemo(
    () => [...operatorSkillUsages].at(operator?.skillUsage || 0),
    [operator?.skillUsage],
  ) as DetailedSelectChoice
  return (
    <div>
      <DetailedSelect
        items={operatorSkillUsages as DetailedSelectItem[]}
        onItemSelect={(item) => {
          const tempOperator = { ...operator }
          tempOperator.skillUsage = item.value as 1 | 2 | 3
          submitOperator('skill', tempOperator as Operator)
        }}
        activeItem={selectedAction}
      >
        <Button
          icon={selectedAction?.icon || 'slash'}
          text={selectedAction ? selectedAction.title : '选择技能用法'}
          rightIcon="double-caret-vertical"
        />
      </DetailedSelect>
      <div>222</div>
    </div>
  )
}

// const SkillAboutForm = ({ operator, submitOperator }: SkillAboutProps) => {
//   // const {}
//   const selectedAction = useMemo(
//     () => [...operatorSkillUsages].at(operator?.skillUsage || 0),
//     [operator?.skillUsage],
//   ) as DetailedSelectChoice

//   const {
//     control,
//     reset,
//     getValues,
//     setValue,
//     handleSubmit,
//     setError,
//     formState: { errors },
//   } = useForm<EditorOperatorFormValues>({
//     defaultValues: operator,
//   })
//   return (
//     <form>
//       <div className="flex flex-col lg:flex-row">
//         <FormField2
//           label="技能"
//           field="skill"
//           error={errors.skill}
//           className="mr-2"
//         >
//           <EditorOperatorSkill control={control} name="skill" />
//         </FormField2>
//       </div>
//       <div>222</div>
//     </form>
//   )
// }

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
          <Icon
            icon="small-info-sign"
            size={12}
            className="flex items-center"
          />
          <p className="text-xs">{`${operator?.skill || '未设置'}技能 ${
            operator?.skillUsage ? '·' : ''
          } `}</p>
          {operator?.skillUsage && (
            <Icon
              icon={
                skillDic.find((item) => item.value === operator?.skillUsage)!
                  .icon
              }
              className="flex items-center ml-1"
            />
          )}
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
      <Popover2
        content={<SkillAboutForm {...{ operator, submitOperator }} />}
        disabled={operator ? false : true}
      >
        {skillAboutTrigger}
      </Popover2>
    </div>
  )
}
