import { InputGroup } from '@blueprintjs/core'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController, UseFormGetValues } from 'react-hook-form'

interface EditorActionOperatorLocationProps<T> extends EditorFieldProps<T> {
  getValues: UseFormGetValues<T>
}

export const EditorActionOperatorLocation = <T extends { type?: string }>({
  name,
  control,
  getValues,
}: EditorActionOperatorLocationProps<T>) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
    rules: {
      validate: (v) => {
        if (
          getValues().type === 'Deploy' &&
          (!v ||
            !Array.isArray(v) ||
            v.length !== 2 ||
            v.some(
              (v) =>
                typeof v !== 'number' ||
                Number.isNaN(v) ||
                v < 0 ||
                !Number.isFinite(v),
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
    <div className="flex">
      <InputGroup
        onChange={(v) => onChange(transform.fromX(castInteger(v.target.value)))}
        value={converted[0] === 0 ? '' : converted[0].toString()}
        placeholder="X 坐标"
        className="mr-2"
      />
      <InputGroup
        onChange={(v) => onChange(transform.fromY(castInteger(v.target.value)))}
        value={converted[1] === 0 ? '' : converted[1].toString()}
        placeholder="Y 坐标"
      />
    </div>
  )
}

function castInteger(v: string | number) {
  const result = typeof v === 'number' ? v : parseInt(v)
  return Number.isNaN(result) || result < 0 || !Number.isFinite(result)
    ? 0
    : result
}
