import { Button, IconName, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { useMemo } from 'react'
import { useController } from 'react-hook-form'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'

interface EditorOperatorSkillChoice {
  icon?: IconName
  title: string
  value: number | null
}
const EditorOperatorSkillSelect = Select2.ofType<EditorOperatorSkillChoice>()

interface EditorOperatorSkillProps<T> extends EditorFieldProps<T> {}

export const EditorOperatorSkill = <T,>({
  name,
  control,
}: EditorOperatorSkillProps<T>) => {
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
        title: '一技能',
        value: 1,
      },
      {
        icon: 'cog',
        title: '二技能',
        value: 2,
      },
      {
        icon: 'cog',
        title: '三技能',
        value: 3,
      },
    ],
    [],
  )

  const selected = items.find((item) => item.value === (value ?? 1))

  return (
    <EditorOperatorSkillSelect
      filterable={false}
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
    </EditorOperatorSkillSelect>
  )
}
