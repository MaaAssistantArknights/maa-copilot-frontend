import { Card, Elevation, Icon } from '@blueprintjs/core'

import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { OPERATORS, getSkillUsageTitle } from '../../../models/operator'
import { SortableItemProps } from '../../dnd'
import { CardDeleteOption, CardEditOption } from '../CardOptions'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorItemProps extends Partial<SortableItemProps> {
  operator: CopilotDocV1.Operator
  editing?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

export const EditorOperatorItem = ({
  operator,
  editing,
  onEdit,
  onRemove,
  isDragging,
  attributes,
  listeners,
}: EditorOperatorItemProps) => {
  const { t, i18n } = useTranslation()

  const id = OPERATORS.find(({ name }) => name === operator.name)?.id
  const skillUsage = getSkillUsageTitle(
    operator.skillUsage as CopilotDocV1.SkillUsageType,
    operator.skillTimes,
  )

  const getSkillDisplay = () => {
    const skillNum = operator.skill

    if (i18n.language === 'cn') {
      // Chinese format: 一技能, 二技能, etc.
      const skillNumberText =
        skillNum === 1
          ? t('components.editor.operator.EditorOperatorItem.first_skill')
          : skillNum === 2
            ? t('components.editor.operator.EditorOperatorItem.second_skill')
            : skillNum === 3
              ? t('components.editor.operator.EditorOperatorItem.third_skill')
              : t('components.editor.operator.EditorOperatorItem.unknown')

      return `${skillNumberText}${t('components.editor.operator.EditorOperatorItem.skill')}：${skillUsage}`
    } else {
      // English format: S1, S2, S3
      const skillText = skillNum
        ? `S${skillNum}`
        : t('components.editor.operator.EditorOperatorItem.unknown')
      return `${skillText}: ${skillUsage}`
    }
  }

  return (
    <Card
      elevation={Elevation.TWO}
      className={clsx(
        'flex items-start',
        editing && 'bg-gray-100',
        isDragging && 'opacity-30',
        'h-[72px] w-[calc(4.5*72px)]',
      )}
    >
      <Icon
        className="cursor-grab active:cursor-grabbing p-1 -mt-1 -ml-2 mr-3 rounded-[1px]"
        icon="drag-handle-vertical"
        {...attributes}
        {...listeners}
      />
      <OperatorAvatar id={id} size="large" />
      <div className="ml-4 flex-grow">
        <h3 className="font-bold leading-none mb-1">{operator.name}</h3>
        <div className="text-gray-400 text-xs">{getSkillDisplay()}</div>
      </div>

      <CardEditOption active={editing} onClick={onEdit} />
      <CardDeleteOption className="-mr-3" onClick={onRemove} />
    </Card>
  )
}
