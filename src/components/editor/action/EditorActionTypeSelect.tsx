import { Button } from '@blueprintjs/core'

import { groupBy } from 'lodash-es'
import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import {
  DetailedSelect,
  DetailedSelectItem,
} from 'components/editor/DetailedSelect'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

import { ACTION_TYPES, findActionType } from '../../../models/types'

export const EditorActionTypeSelect = (
  props: EditorFieldProps<CopilotDocV1.Action, CopilotDocV1.Type>,
) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    rules: { required: '请选择动作类型' },
    ...props,
  })

  const menuItems = useMemo<DetailedSelectItem[]>(
    () =>
      Object.entries(groupBy(ACTION_TYPES, 'group')).flatMap(
        ([group, items]) => [
          { type: 'header' as const, header: group },
          ...items,
        ],
      ),
    [],
  )
  const selectedAction = findActionType(value)

  return (
    <DetailedSelect
      items={menuItems}
      onItemSelect={(item) => {
        onChange(item.value)
      }}
      activeItem={selectedAction}
    >
      <Button
        large
        icon={selectedAction?.icon || 'slash'}
        text={selectedAction ? selectedAction.title : '选择动作'}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </DetailedSelect>
  )
}
