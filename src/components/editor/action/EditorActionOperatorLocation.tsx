import { InputGroup } from '@blueprintjs/core'

import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { FieldResetButton } from '../../FieldResetButton'
import { FormField2 } from '../../FormField'

interface EditorActionOperatorLocationProps
  extends EditorFieldProps<CopilotDocV1.Action, [number, number]> {
  actionType: CopilotDocV1.Type
}

export const EditorActionOperatorLocation = ({
  name,
  control,
  actionType,
  rules,
  ...controllerProps
}: EditorActionOperatorLocationProps) => {
  const isRequired = actionType === 'Deploy'

  const {
    field: { onChange, value },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: {
      required: isRequired && '必须填写位置',
      validate: (v) =>
        // v being undefined is allowed because the `required` rule will handle it properly
        !v ||
        (Array.isArray(v) &&
          v.length === 2 &&
          v.every((i) => i >= 0 && Number.isFinite(i))) ||
        '位置不合法',
      ...rules,
    },
    ...controllerProps,
  })

  const transform: Record<
    string,
    (v?: number) => [number | undefined, number | undefined]
  > = {
    fromX: (v) => [v, value?.[1]],
    fromY: (v) => [value?.[0], v],
  }

  const reset = (value: [number | undefined, number | undefined]) => {
    // if both are reset, reset the entire field
    if (value[0] === undefined && value[1] === undefined) {
      onChange(undefined)
    } else {
      onChange(value)
    }
  }

  return (
    <FormField2
      label="干员位置"
      field="location"
      asterisk={isRequired}
      error={errors[name]}
      description="填完关卡名后开一局，会在目录下 map 文件夹中生成地图坐标图片"
      className="mr-4"
    >
      <div className="flex">
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromX(castInteger(v.target.value)))
          }
          value={value?.[0]?.toString() ?? ''}
          placeholder="X 坐标"
          className="mr-2"
          rightElement={
            <FieldResetButton
              value={value?.[0]}
              onReset={() => reset(transform.fromX(undefined))}
            />
          }
        />
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromY(castInteger(v.target.value)))
          }
          value={value?.[1]?.toString() ?? ''}
          placeholder="Y 坐标"
          rightElement={
            <FieldResetButton
              value={value?.[1]}
              onReset={() => reset(transform.fromY(undefined))}
            />
          }
        />
      </div>
    </FormField2>
  )
}

function castInteger(v: string | number) {
  const result = typeof v === 'number' ? v : parseInt(v)
  return result < 0 || !Number.isFinite(result) ? 0 : result
}
