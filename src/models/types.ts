import { IconName } from '@blueprintjs/core'
interface ActionType {
  type: 'choice'
  icon: IconName
  accent: string
  title: string
  value: string
  alternativeValue: string
  description: string
  group: string
}

const accent = {
  red: 'border-red-600',
  amber: 'border-amber-600',
  lime: 'border-lime-600',
  emerald: 'border-emerald-600',
  cyan: 'border-cyan-600',
  blue: 'border-blue-600',
  violet: 'border-violet-600',
  fuchsia: 'border-fuchsia-600',
  zinc: 'border-zinc-600',
}

export const ACTION_TYPES: ActionType[] = [
  {
    type: 'choice',
    icon: 'new-object',
    accent: accent.red,
    title: '部署',
    value: 'Deploy',
    alternativeValue: '部署',
    description: `部署干员至指定位置。当费用不够时，会一直等待到费用够（除非 timeout）`,
    group: '干员上/退场',
  },
  {
    type: 'choice',
    icon: 'graph-remove',
    accent: accent.amber,
    title: '撤退',
    value: 'Retreat',
    alternativeValue: '撤退',
    description: '将干员从作战中撤出',
    group: '干员上/退场',
  },
  {
    type: 'choice',
    icon: 'target',
    accent: accent.lime,
    title: '使用技能',
    value: 'Skill',
    alternativeValue: '技能',
    description: `当技能 CD 没转好时，一直等待到技能 CD 好（除非 timeout）`,
    group: '干员技能',
  },
  {
    type: 'choice',
    icon: 'swap-horizontal',
    accent: accent.emerald,
    title: '切换技能用法',
    value: 'SkillUsage',
    alternativeValue: '技能用法',
    description: `切换干员技能用法。例如，刚下桃金娘、需要她帮忙打几个怪，但此时不能自动开技能否则会漏怪，等中后期平稳了才需要她自动开技能，则可以在对应时刻后，将桃金娘的技能用法从「不自动使用」改为「好了就用」。`,
    group: '干员技能',
  },
  {
    type: 'choice',
    icon: 'fast-forward',
    accent: accent.cyan,
    title: '切换二倍速',
    value: 'SpeedUp',
    alternativeValue: '二倍速',
    description: `执行后切换至二倍速，再次执行切换至一倍速`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'fast-backward',
    accent: accent.blue,
    title: '进入子弹时间',
    value: 'BulletTime',
    alternativeValue: '子弹时间',
    description: `执行后将点击任意干员，进入 1/5 速度状态；再进行任意动作会恢复正常速度`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'antenna',
    accent: accent.violet,
    title: '开始挂机',
    value: 'SkillDaemon',
    alternativeValue: '摆完挂机',
    description: `进入挂机模式。仅使用 “好了就用” 的技能，其他什么都不做，直到战斗结束`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'paragraph',
    accent: accent.fuchsia,
    title: '打印描述内容',
    value: 'Ouput',
    alternativeValue: '打印',
    description: `对作战没有实际作用，仅用于输出描述内容（用来做字幕之类的）`,
    group: '杂项',
  },
]

const notFoundActionType: ActionType = {
  type: 'choice',
  icon: 'help',
  accent: accent.zinc,
  title: '未知类型',
  value: 'Unknown',
  alternativeValue: '未知',
  description: `未知动作类型`,
  group: '未知',
}

export const findActionType = (type?: string) => {
  if (!type) return notFoundActionType
  return (
    ACTION_TYPES.find(
      (item) => item.value === type || item.alternativeValue === type,
    ) || notFoundActionType
  )
}
