import { Button, Card, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { FC, useMemo, useState } from 'react'
import {
  EditorPerformerGroup,
  EditorPerformerGroupProps,
} from './EditorPerformerGroup'
import {
  EditorPerformerOperator,
  EditorPerformerOperatorProps,
} from './EditorPerformerOperator'

export interface EditorPerformerAddProps {
  submitOperator: EditorPerformerOperatorProps['submit']
  submitGroup: EditorPerformerGroupProps['submit']
}

type PerformerType = 'operator' | 'group'

interface PerformerSelectItem {
  label: string
  value: PerformerType
}

const performerSelectItems: PerformerSelectItem[] = [
  { label: '干员', value: 'operator' },
  { label: '干员组', value: 'group' },
]

export const EditorPerformerAdd: FC<EditorPerformerAddProps> = ({
  submitOperator,
  submitGroup,
}) => {
  const [mode, setMode] = useState<PerformerType>('operator')

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
        onItemSelect={(e) => {
          console.log('selected', e.value)
          setMode(e.value)
        }}
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
        submit={submitOperator}
        categorySelector={selector}
      />
    ) : (
      <EditorPerformerGroup submit={submitGroup} categorySelector={selector} />
    )
  }, [mode, submitOperator, submitGroup])

  return <Card className="mb-8 pt-4">{child}</Card>
}
