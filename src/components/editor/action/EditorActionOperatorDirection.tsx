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
  value: CopilotDocV1.Direction | null
}

interface EditorActionOperatorDirectionProps
  extends SetOptional<
    EditorFieldProps<CopilotDocV1.Action, CopilotDocV1.Direction>,
    'name'
  > {}

export const EditorActionOperatorDirection = ({
  name = 'direction',
  control,
}: EditorActionOperatorDirectionProps) => {
  const {
    field: { onChange, onBlur, value, ref },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: { required: '必须选择朝向' },
    defaultValue: 'None' as CopilotDocV1.Direction.None,
  })

  const items = useMemo<EditorActionOperatorDirectionChoice[]>(
    () => [
      // TODO: remove these string literals when CopilotDocV1 can be imported
      {
        icon: 'slash',
        title: '无',
        value: 'None' as CopilotDocV1.Direction.None,
      },
      {
        icon: 'arrow-up',
        title: '上',
        value: 'Up' as CopilotDocV1.Direction.Up,
      },
      {
        icon: 'arrow-down',
        title: '下',
        value: 'Down' as CopilotDocV1.Direction.Down,
      },
      {
        icon: 'arrow-left',
        title: '左',
        value: 'Left' as CopilotDocV1.Direction.Left,
      },
      {
        icon: 'arrow-right',
        title: '右',
        value: 'Right' as CopilotDocV1.Direction.Right,
      },
    ],
    [],
  )

  const selected = items.find((item) => item.value === value)

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
