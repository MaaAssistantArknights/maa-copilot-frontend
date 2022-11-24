import { Icon, Tag } from '@blueprintjs/core'
import { UniqueIdentifier } from '@dnd-kit/core'

import { compact } from 'lodash-es'
import { useMemo, useState } from 'react'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { FieldErrorsWithGlobal } from '../../../types'
import { SortableItemProps } from '../../dnd'
import { CardDeleteOption } from '../CardOptions'
import { ExpandableCard } from '../ExpandableCard'
import {
  EditorGroupForm,
  EditorGroupFormProps,
  EditorGroupFormValues,
} from './EditorGroupForm'

interface EditorGroupItemProps extends Partial<SortableItemProps> {
  group: CopilotDocV1.Group
  onChange?: EditorGroupFormProps['onChange']
  onRemove?: () => void
  getOperatorId: (operator: CopilotDocV1.Operator) => UniqueIdentifier
}

export const EditorGroupItem = ({
  group,
  onChange,
  onRemove,
  attributes,
  listeners,
}: EditorGroupItemProps) => {
  const [expand, setExpand] = useState(false)
  const [errors, setErrors] = useState(
    {} as FieldErrorsWithGlobal<EditorGroupFormValues>,
  )

  const error = useMemo(
    // display global error or the first field error
    () => (errors.global || compact(Object.values(errors))[0])?.message,
    [errors],
  )

  return (
    <ExpandableCard
      expand={expand}
      setExpand={setExpand}
      content={
        <>
          <EditorGroupForm
            group={group}
            onChange={onChange}
            onError={setErrors}
          />
        </>
      }
    >
      <div className="flex items-start mb-2">
        <Icon
          className="cursor-grab active:cursor-grabbing p-1 -mt-1 -ml-2 rounded-[1px]"
          icon="drag-handle-vertical"
          {...attributes}
          {...listeners}
        />

        <h3 className="font-bold leading-none flex-grow">
          <span>
            {group.name} ({group.opers?.length})
          </span>
          {error && <Tag minimal intent="danger">{error}</Tag>}
        </h3>

        <CardDeleteOption className="-mr-3" onClick={onRemove} />
      </div>

      <div className="flex flex-wrap gap-1 text-gray-400">
        {group.opers?.map(({ _id, name, skill }) => (
          <Tag key={_id}>
            {name} {skill || 1}
          </Tag>
        ))}

        {!group.opers?.length && '请添加干员'}
      </div>
    </ExpandableCard>
  )
}
