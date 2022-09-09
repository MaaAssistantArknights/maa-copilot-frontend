import { Button, Card, MenuItem, NonIdealState } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'
import { FC, useMemo, useState } from 'react'
import { Control, useFieldArray } from 'react-hook-form'
import { AppToaster } from '../../Toaster'
import { EditorGroupItem } from './EditorGroupItem'
import { EditorOperatorItem } from './EditorOperatorItem'
import { EditorPerformerGroup } from './EditorPerformerGroup'
import { EditorPerformerOperator } from './EditorPerformerOperator'

type PerformerType = 'operator' | 'group'

export interface EditorPerformerAddProps {
  appendOperator: (operator: CopilotDocV1.Operator) => void
  appendGroup: (group: CopilotDocV1.Group) => void
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
  appendOperator,
  appendGroup,
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
        submit={appendOperator}
        categorySelector={selector}
      />
    ) : (
      <EditorPerformerGroup submit={appendGroup} categorySelector={selector} />
    )
  }, [mode, appendOperator, appendGroup])

  return <Card className="mb-8 pt-4">{child}</Card>
}

export interface EditorPerformerChildProps {
  submit: (action: CopilotDocV1.Operator) => void
  categorySelector: JSX.Element
}

export const EditorPerformer: FC<{
  control: Control<CopilotDocV1.Operation>
}> = ({ control }) => {
  const {
    fields: operators,
    append: _appendOperator,
    move,
  } = useFieldArray({
    name: 'opers',
    control,
  })
  const { fields: groups, append: _appendGroup } = useFieldArray({
    name: 'groups',
    control,
  })

  const appendOperator = (operator: CopilotDocV1.Operator) => {
    if (operators.find(({ name }) => name === operator.name)) {
      AppToaster.show({
        intent: 'warning',
        message: '该干员已存在',
      })
      return
    }

    _appendOperator(operator)
  }

  const appendGroup = (group: CopilotDocV1.Group) => {
    if (groups.find(({ name }) => name === group.name)) {
      AppToaster.show({
        intent: 'warning',
        message: '该干员组已存在',
      })
      return
    }

    _appendGroup(group)
  }

  return (
    <>
      <EditorPerformerAdd
        appendOperator={appendOperator}
        appendGroup={appendGroup}
      />

      <div className="p-2 -mx-2 relative">
        {groups.length !== 0 && (
          <ul>
            {groups.map((group) => (
              <li key={group.name}>
                <EditorGroupItem group={group} />
              </li>
            ))}
          </ul>
        )}
        {operators.length !== 0 && (
          <ul>
            {operators.map((operator) => (
              <li className="mb-2" key={operator.name}>
                <EditorOperatorItem operator={operator} />
              </li>
            ))}
          </ul>
        )}

        {operators.length === 0 && groups.length === 0 && (
          <NonIdealState title="暂无干员" icon="inbox" />
        )}
      </div>
    </>
  )
}
