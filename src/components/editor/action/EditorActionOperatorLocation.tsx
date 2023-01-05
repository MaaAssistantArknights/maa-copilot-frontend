import { InputGroup } from '@blueprintjs/core'

import { useEffect } from 'react'
import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { Level } from '../../../models/operation'
import { useMessage } from '../../../utils/messenger'
import { FieldResetButton } from '../../FieldResetButton'
import { FormField2 } from '../../FormField'
import { useFloatingMap } from '../floatingMap/FloatingMapContext'
import { MAP_ORIGIN, TileClickMessage } from '../floatingMap/connection'

interface EditorActionOperatorLocationProps
  extends EditorFieldProps<CopilotDocV1.Action, [number, number]> {
  actionType: CopilotDocV1.Type
  level?: Level
}

export const EditorActionOperatorLocation = ({
  name,
  control,
  actionType,
  level,
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
      validate: (v) => {
        // v being undefined is allowed because the `required` rule will handle it properly
        if (v) {
          if (
            !(
              Array.isArray(v) &&
              v.length === 2 &&
              v.every((i) => i >= 0 && Number.isFinite(i))
            )
          ) {
            return '位置不是有效的数字'
          }

          if (level) {
            if (v[0] >= level.width) {
              return `X 坐标超出地图范围 (0-${level.width - 1})`
            }
            if (v[1] >= level.height) {
              return `Y 坐标超出地图范围 (0-${level.height - 1})`
            }
          }
        }
        return undefined
      },
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

  const { setActiveTiles } = useFloatingMap()

  useEffect(() => {
    if (value?.[0] !== undefined && value?.[1] !== undefined) {
      setActiveTiles([{ x: value[0], y: value[1] }])
    } else {
      setActiveTiles([])
    }
  }, [value, setActiveTiles])

  // reset active tiles when unmounting
  useEffect(() => () => setActiveTiles([]), [setActiveTiles])

  useMessage<TileClickMessage>(MAP_ORIGIN, 'tileClick', (e) => {
    const [x, y] = e.message.data.maaLocation
    onChange([x, y])
  })

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
      FormGroupProps={{
        helperText: '可在地图上点击以选择位置',
      }}
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
              disabled={value?.[0] === undefined}
              onReset={() => reset(transform.fromX(undefined))}
            />
          }
          onFocus={(e) => e.target.select()}
        />
        <InputGroup
          onChange={(v) =>
            onChange(transform.fromY(castInteger(v.target.value)))
          }
          value={value?.[1]?.toString() ?? ''}
          placeholder="Y 坐标"
          rightElement={
            <FieldResetButton
              disabled={value?.[1] === undefined}
              onReset={() => reset(transform.fromY(undefined))}
            />
          }
          onFocus={(e) => e.target.select()}
        />
      </div>
    </FormField2>
  )
}

function castInteger(v: string | number) {
  const result = typeof v === 'number' ? v : parseInt(v)
  return result < 0 || !Number.isFinite(result) ? 0 : result
}
