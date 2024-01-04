import { Button, IconName, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'

import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { operatorSkills } from 'models/operator'

export interface EditorOperatorSkillChoice {
  icon?: IconName
  title: string
  value: number | null
}
const EditorOperatorSkillSelect = Select2.ofType<EditorOperatorSkillChoice>()

interface EditorOperatorSkillProps
  extends EditorFieldProps<CopilotDocV1.Operator, number> {}

export const EditorOperatorSkill = ({
  name,
  control,
}: EditorOperatorSkillProps) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
  })

  const selected = operatorSkills.find((item) => item.value === (value ?? 1))

  return (
    <EditorOperatorSkillSelect
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
      onItemSelect={(item) => {
        onChange(item.value)
      }}
    >
      <Button
        icon={selected?.icon}
        text={selected?.title}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </EditorOperatorSkillSelect>
  )
}
