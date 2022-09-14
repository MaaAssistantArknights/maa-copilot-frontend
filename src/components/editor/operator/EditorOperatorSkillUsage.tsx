import { Button } from '@blueprintjs/core'
import {
  DetailedSelect,
  DetailedSelectChoice,
} from 'components/editor/DetailedSelect'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useController } from 'react-hook-form'
import { operatorSkillUsages } from '../../../models/operator'

export const EditorOperatorSkillUsage = <T,>({
  name,
  control,
}: EditorFieldProps<T>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
  })

  const selectedAction = operatorSkillUsages.find(
    (action) => action.type === 'choice' && action.value === (value ?? 0),
  ) as DetailedSelectChoice | undefined

  return (
    <DetailedSelect
      items={operatorSkillUsages}
      onItemSelect={(item) => {
        onChange(item.value)
      }}
      activeItem={selectedAction}
    >
      <Button
        icon={selectedAction?.icon || 'slash'}
        text={selectedAction ? selectedAction.title : '选择技能用法'}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </DetailedSelect>
  )
}
