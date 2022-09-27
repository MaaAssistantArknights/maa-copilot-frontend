import { Button, Card, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { FC, useMemo } from 'react'
import {
  EditorPerformerGroup,
  EditorPerformerGroupProps,
} from './EditorPerformerGroup'
import {
  EditorPerformerOperator,
  EditorPerformerOperatorProps,
} from './EditorPerformerOperator'
import type { CopilotDocV1 } from 'models/copilot.schema'

export type PerformerType = 'operator' | 'group'

export interface EditorPerformerAddProps {
  mode: PerformerType
  operator?: CopilotDocV1.Operator
  group?: CopilotDocV1.Group
  onModeChange: (mode: PerformerType) => void
  onCancel: () => void
  submitOperator: EditorPerformerOperatorProps['submit']
  submitGroup: EditorPerformerGroupProps['submit']
}

interface PerformerSelectItem {
  label: string
  value: PerformerType
}

const performerSelectItems: PerformerSelectItem[] = [
  { label: '干员', value: 'operator' },
  { label: '干员组', value: 'group' },
]

export const EditorPerformerAdd: FC<EditorPerformerAddProps> = ({
  mode,
  operator,
  group,
  onModeChange,
  onCancel,
  submitOperator,
  submitGroup,
}) => {
  const activeItem =
    performerSelectItems.find((item) => item.value === mode) ||
    performerSelectItems[0]

  const selector = (
    <>
      添加
      <Select2<PerformerSelectItem>
        filterable={false}
        items={performerSelectItems}
        className="ml-1"
        onItemSelect={(e) => onModeChange(e.value)}
        itemRenderer={(action, { handleClick, handleFocus, modifiers }) => (
          <MenuItem
            key={action.value}
            selected={modifiers.active}
            onClick={handleClick}
            onFocus={handleFocus}
            text={action.label}
          />
        )}
        activeItem={activeItem}
      >
        <Button
          large
          text={activeItem.label}
          rightIcon="double-caret-vertical"
        />
      </Select2>
    </>
  )

  const child = useMemo(() => {
    return mode === 'operator' ? (
      <EditorPerformerOperator
        operator={operator}
        submit={submitOperator}
        onCancel={onCancel}
        categorySelector={selector}
      />
    ) : (
      <EditorPerformerGroup
        group={group}
        submit={submitGroup}
        onCancel={onCancel}
        categorySelector={selector}
      />
    )
  }, [mode, submitOperator, submitGroup])

  return <Card className="mb-8 pt-4">{child}</Card>
}
