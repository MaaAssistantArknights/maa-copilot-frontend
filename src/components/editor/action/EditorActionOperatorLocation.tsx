import { InputGroup } from '@blueprintjs/core'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController } from 'react-hook-form'
import { FormField2 } from '../../FormField'

interface EditorActionOperatorLocationProps
  extends EditorFieldProps<CopilotDocV1.Action, [number, number]> {
  actionType: CopilotDocV1.Type
}

export const EditorActionOperatorLocation = ({
  name,
  control,
  actionType,
}: EditorActionOperatorLocationProps) => {
  const {
    field: { onChange, value },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: {
      validate: (v) => {
        if (
          actionType === 'Deploy' &&
          (!v ||
            !Array.isArray(v) ||
            v.length !== 2 ||
            v.some(
              (i) =>
                typeof i !== 'number' ||
                Number.isNaN(i) ||
                i < 0 ||
                !Number.isFinite(i),
            ))
        )
          return '部署动作下必须填写位置'
        return true
      },
    },
  })

  const converted = value ?? [0, 0]

  const transform = {
    fromX: (v: number) => [v, converted[1]],
    fromY: (v: number) => [converted[0], v],
  }

  return (
    <FormField2
      label="干员位置"
      field="location"
      error={errors[name]}
      description="填完关卡名后开一局，会在目录下 map 文件夹中生成地图坐标图片"
      className="mr-4"
    >
      <div className="flex">
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromX(castInteger(v.target.value)))
          }
          value={converted[0] === 0 ? '' : converted[0].toString()}
          placeholder="X 坐标"
          className="mr-2"
        />
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromY(castInteger(v.target.value)))
          }
          value={converted[1] === 0 ? '' : converted[1].toString()}
          placeholder="Y 坐标"
        />
      </div>
    </FormField2>
  )
}

function castInteger(v: string | number) {
  const result = typeof v === 'number' ? v : parseInt(v)
  return Number.isNaN(result) || result < 0 || !Number.isFinite(result)
    ? 0
    : result
}
