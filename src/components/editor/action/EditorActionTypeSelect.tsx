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

import { useTranslation } from '../../../i18n/i18n'
import { ACTION_TYPES, findActionType } from '../../../models/types'

export const EditorActionTypeSelect = (
  props: EditorFieldProps<CopilotDocV1.Action, CopilotDocV1.Type>,
) => {
  const t = useTranslation()
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    rules: {
      required:
        t.components.editor.action.EditorActionTypeSelect
          .select_action_type_required,
    },
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
      value={selectedAction.value}
    >
      <Button
        large
        icon={selectedAction?.icon || 'slash'}
        text={
          selectedAction
            ? selectedAction.title()
            : t.components.editor.action.EditorActionTypeSelect.select_action
        }
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </DetailedSelect>
  )
}
