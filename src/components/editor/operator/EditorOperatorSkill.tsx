import { Button, IconName, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

interface EditorOperatorSkillChoice {
  icon?: IconName
  title: string
  value: number | null
}

interface EditorOperatorSkillProps
  extends EditorFieldProps<CopilotDocV1.Operator, number> {}

export const EditorOperatorSkill = ({
  name,
  control,
}: EditorOperatorSkillProps) => {
  const { t } = useTranslation()

  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
  })

  const items = useMemo<EditorOperatorSkillChoice[]>(
    () => [
      {
        icon: 'cog',
        title: t('components.editor.operator.EditorOperatorSkill.first_skill'),
        value: 1,
      },
      {
        icon: 'cog',
        title: t('components.editor.operator.EditorOperatorSkill.second_skill'),
        value: 2,
      },
      {
        icon: 'cog',
        title: t('components.editor.operator.EditorOperatorSkill.third_skill'),
        value: 3,
      },
    ],
    [t],
  )

  const selected = items.find((item) => item.value === (value ?? 1))

  return (
    <Select2<EditorOperatorSkillChoice>
      filterable={false}
      resetOnSelect={true}
      items={items}
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
    </Select2>
  )
}
