import { Button, MenuItem, Icon } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController } from 'react-hook-form'
import { SetOptional } from 'type-fest'
import { actionDocColors } from 'models/operator'
import { FormField2 } from 'components/FormField'

interface EditorActionDocColorProps
  extends SetOptional<EditorFieldProps<CopilotDocV1.Action, string>, 'name'> {}

export const EditorActionDocColor = ({
  name = 'docColor',
  control,
  ...controllerProps
}: EditorActionDocColorProps) => {
  const {
    field: { onChange, onBlur, value, ref },
    formState: { errors },
  } = useController({
    name,
    control,
    defaultValue: 'Gray',
    ...controllerProps,
  })

  const selected = actionDocColors.find((item) => item.value === value)

  return (
    <FormField2
      label="描述颜色"
      field={name}
      error={errors[name]}
      description="在MAA中打印描述时的颜色"
    >
      <Select2
        filterable={false}
        items={actionDocColors}
        itemRenderer={(color, { handleClick, handleFocus, modifiers }) => (
          <MenuItem
            selected={modifiers.active}
            key={color.value}
            onClick={handleClick}
            onFocus={handleFocus}
            text={
              <span>
                <Icon
                  icon="full-circle"
                  color={color?.value}
                  className="mr-2"
                />
                <span style={{ color: color?.value }}>{color?.title}</span>
              </span>
            }
          />
        )}
        onItemSelect={(item) => {
          onChange(item.value)
        }}
      >
        <Button rightIcon="double-caret-vertical" onBlur={onBlur} ref={ref}>
          <Icon icon="full-circle" color={selected?.value} />
          <span style={{ color: selected?.value }}>{selected?.title}</span>
        </Button>
      </Select2>
    </FormField2>
  )
}
