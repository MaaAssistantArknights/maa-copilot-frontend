import { Button, IconName, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useMemo } from 'react'
import { useController } from 'react-hook-form'
import { SetOptional } from 'type-fest'
import { FormField2 } from '../../FormField'

interface EditorActionOperatorDirectionChoice {
  icon?: IconName
  title: string
  value: string | null
}

interface EditorActionOperatorDirectionProps
  extends SetOptional<EditorFieldProps<CopilotDocV1.Action>, 'name'> {
  actionType: CopilotDocV1.Type
}

export const EditorActionOperatorDirection = ({
  name = 'direction',
  control,
  actionType,
}: EditorActionOperatorDirectionProps) => {
  const {
    field: { onChange, onBlur, value, ref },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: {
      validate: (v) => {
        if (actionType === 'Deploy' && !v) return '部署动作下必须选择朝向'
        return true
      },
    },
  })

  const items = useMemo<EditorActionOperatorDirectionChoice[]>(
    () => [
      {
        icon: 'slash',
        title: '选择朝向',
        value: null,
      },
      {
        icon: 'arrow-up',
        title: '上',
        value: 'Up',
      },
      {
        icon: 'arrow-down',
        title: '下',
        value: 'Down',
      },
      {
        icon: 'arrow-left',
        title: '左',
        value: 'Left',
      },
      {
        icon: 'arrow-right',
        title: '右',
        value: 'Right',
      },
    ],
    [],
  )

  const selected = items.find((item) => item.value === (value ?? null))

  return (
    <FormField2
      label="干员朝向"
      field={name}
      error={errors[name]}
      description="部署干员的干员朝向"
    >
      <Select2
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
      </Select2>
    </FormField2>
  )
}
