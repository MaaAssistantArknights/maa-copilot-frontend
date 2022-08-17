import { Button, Card, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { FC, useMemo, useState } from 'react'
import { Control } from 'react-hook-form'
import { EditorPerformerGroup } from './EditorPerformerGroup'
import { EditorPerformerOperator } from './EditorPerformerOperator'

export interface EditorPerformerAddProps {
  append: (
    type: 'operator' | 'group',
    performer: CopilotDocV1.Operator | CopilotDocV1.Group,
  ) => void
}

interface PerformerSelectItem {
  label: string
  value: 'operator' | 'group'
}

const performerSelectItems: PerformerSelectItem[] = [
  { label: '干员', value: 'operator' },
  { label: '干员组', value: 'group' },
]

export const EditorPerformerAdd = ({ append }) => {
  const [mode, setMode] = useState<'operator' | 'group'>('operator')

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
        submit={(values) => {
          append(values)
        }}
        categorySelector={selector}
      />
    ) : (
      <EditorPerformerGroup
        submit={(values) => {
          append(values)
        }}
        categorySelector={selector}
      />
    )
  }, [mode])

  return <Card className="mb-8 pt-4">{child}</Card>
}

export interface EditorPerformerChildProps {
  submit: (action: CopilotDocV1.Operator) => void
  categorySelector: JSX.Element
}

export const EditorPerformer: FC<{
  control: Control<CopilotDocV1.Operation>
}> = ({ control }) => {
  return (
    <>
      {/* {categorySelector} */}
      <EditorPerformerAdd />
    </>
  )
}
