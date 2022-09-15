import { Button } from '@blueprintjs/core'
import {
  DetailedSelect,
  DetailedSelectChoice,
  DetailedSelectItem,
} from 'components/editor/DetailedSelect'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { useMemo } from 'react'
import { useController } from 'react-hook-form'

export const EditorActionTypeSelect = ({
  name,
  control,
}: EditorFieldProps<CopilotDocV1.Action, CopilotDocV1.Type>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    rules: { required: '请选择动作类型' },
  })

  const menuItems = useMemo<DetailedSelectItem[]>(
    () => [
      { type: 'header', header: '干员上/退场' },
      {
        type: 'choice',
        icon: 'new-object',
        title: '部署',
        value: 'Deploy',
        description: `部署干员至指定位置。当费用不够时，会一直等待到费用够（除非 timeout）`,
      },
      {
        type: 'choice',
        icon: 'graph-remove',
        title: '撤退',
        value: 'Retreat',
        description: '将干员从作战中撤出',
      },
      { type: 'header', header: '干员技能' },
      {
        type: 'choice',
        icon: 'target',
        title: '使用技能',
        value: 'Skill',
        description: `当技能 CD 没转好时，一直等待到技能 CD 好（除非 timeout）`,
      },
      {
        type: 'choice',
        icon: 'swap-horizontal',
        title: '切换技能用法',
        value: 'SkillUsage',
        description: `切换干员技能用法。例如，刚下桃金娘、需要她帮忙打几个怪，但此时不能自动开技能否则会漏怪，等中后期平稳了才需要她自动开技能，则可以在对应时刻后，将桃金娘的技能用法从「不自动使用」改为「好了就用」。`,
      },
      { type: 'header', header: '作战控制' },
      {
        type: 'choice',
        icon: 'fast-forward',
        title: '切换二倍速',
        value: 'SpeedUp',
        description: `执行后切换至二倍速，再次执行切换至一倍速`,
      },
      {
        type: 'choice',
        icon: 'fast-backward',
        title: '进入子弹时间',
        value: 'BulletTime',
        description: `执行后将点击任意干员，进入 1/5 速度状态；再进行任意动作会恢复正常速度`,
      },
      {
        type: 'choice',
        icon: 'antenna',
        title: '开始挂机',
        value: 'SkillDaemon',
        description: `进入挂机模式。仅使用 “好了就用” 的技能，其他什么都不做，直到战斗结束`,
      },
      { type: 'header', header: '杂项' },
      {
        type: 'choice',
        icon: 'paragraph',
        title: '打印描述内容',
        value: 'Output',
        description: `对作战没有实际作用，仅用于输出描述内容（用来做字幕之类的）`,
      },
    ],
    [],
  )
  const selectedAction = menuItems.find(
    (action) => action.type === 'choice' && action.value === value,
  ) as DetailedSelectChoice | undefined

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
