import { Button, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController } from 'react-hook-form'
import { SetOptional } from 'type-fest'
import { operatorDirections } from '../../../models/operator'
import { FormField2 } from '../../FormField'

interface EditorActionOperatorDirectionProps
  extends SetOptional<
    EditorFieldProps<CopilotDocV1.Action, CopilotDocV1.Direction>,
    'name'
  > {}

export const EditorActionOperatorDirection = ({
  name = 'direction',
  control,
  ...controllerProps
}: EditorActionOperatorDirectionProps) => {
  const {
    field: { onChange, onBlur, value, ref },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: { required: '必须选择朝向' },
    defaultValue: 'None' as CopilotDocV1.Direction.None,
    ...controllerProps,
  })

  const selected = operatorDirections.find((item) => item.value === value)

  return (
    <FormField2
      label="干员朝向"
      field={name}
      error={errors[name]}
      description="部署干员的干员朝向"
    >
      <Select2
        filterable={false}
        items={operatorDirections}
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
