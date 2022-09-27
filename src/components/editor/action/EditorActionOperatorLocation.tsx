import { InputGroup } from '@blueprintjs/core'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController } from 'react-hook-form'
import { FormField2 } from '../../FormField'
import type { CopilotDocV1 } from 'models/copilot.schema'

interface EditorActionOperatorLocationProps
  extends EditorFieldProps<CopilotDocV1.Action, [number, number]> {
  actionType: CopilotDocV1.Type
}

export const EditorActionOperatorLocation = ({
  name,
  control,
  actionType,
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
    },
    ...controllerProps,
  })

  const transform = {
    fromX: (v: number) => [v, value?.[1]],
    fromY: (v: number) => [value?.[0], v],
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
        />
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromY(castInteger(v.target.value)))
          }
          value={value?.[1]?.toString() ?? ''}
          placeholder="Y 坐标"
        />
      </div>
    </FormField2>
  )
}

function castInteger(v: string | number) {
  const result = typeof v === 'number' ? v : parseInt(v)
  return result < 0 || !Number.isFinite(result) ? 0 : result
}
