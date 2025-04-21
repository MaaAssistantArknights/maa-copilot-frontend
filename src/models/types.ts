import { IconName } from '@blueprintjs/core'

import { groupBy } from 'lodash-es'

import { CopilotDocV1 } from './copilot.schema'

interface ActionType {
  type: 'choice'
  icon: IconName
  accent: string
  accentText: string
  accentBg: string
  title: string
  shortTitle: string
  value: CopilotDocV1.Type
  alternativeValue: string
  description: string
  group: string
}
export const ACTION_TYPES: ActionType[] = [
  {
    type: 'choice',
    icon: 'new-object',
    accent: 'border-red-700',
    accentText: 'text-red-700 dark:text-red-400',
    accentBg: 'bg-red-700',
    title: '部署',
    shortTitle: '部署',
    value: CopilotDocV1.Type.Deploy,
    alternativeValue: '部署',
    description: `部署干员至指定位置。当费用不够时，会一直等待到费用够（除非 timeout）`,
    group: '干员上/退场',
  },
  {
    type: 'choice',
    icon: 'graph-remove',
    accent: 'border-amber-700',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBg: 'bg-amber-700',
    title: '撤退',
    shortTitle: '撤退',
    value: CopilotDocV1.Type.Retreat,
    alternativeValue: '撤退',
    description: '将干员从作战中撤出',
    group: '干员上/退场',
  },
  {
    type: 'choice',
    icon: 'target',
    accent: 'border-lime-700',
    accentText: 'text-lime-700 dark:text-lime-400',
    accentBg: 'bg-lime-700',
    title: '使用技能',
    shortTitle: '使用技能',
    value: CopilotDocV1.Type.Skill,
    alternativeValue: '技能',
    description: `当技能 CD 没转好时，一直等待到技能 CD 好（除非 timeout）`,
    group: '干员技能',
  },
  {
    type: 'choice',
    icon: 'swap-horizontal',
    accent: 'border-emerald-700',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBg: 'bg-emerald-700',
    title: '切换技能用法',
    shortTitle: '技能用法',
    value: CopilotDocV1.Type.SkillUsage,
    alternativeValue: '技能用法',
    description: `切换干员技能用法。例如，刚下桃金娘、需要她帮忙打几个怪，但此时不能自动开技能否则会漏怪，等中后期平稳了才需要她自动开技能，则可以在对应时刻后，将桃金娘的技能用法从「不自动使用」改为「好了就用」。`,
    group: '干员技能',
  },
  {
    type: 'choice',
    icon: 'fast-forward',
    accent: 'border-cyan-700',
    accentText: 'text-cyan-700 dark:text-cyan-400',
    accentBg: 'bg-cyan-700',
    title: '切换二倍速',
    shortTitle: '二倍速',
    value: CopilotDocV1.Type.SpeedUp,
    alternativeValue: '二倍速',
    description: `执行后切换至二倍速，再次执行切换至一倍速`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'fast-backward',
    accent: 'border-blue-700',
    accentText: 'text-blue-700 dark:text-blue-400',
    accentBg: 'bg-blue-700',
    title: '进入子弹时间',
    shortTitle: '子弹时间',
    value: CopilotDocV1.Type.BulletTime,
    alternativeValue: '子弹时间',
    description: `执行后将点击任意干员，进入 1/5 速度状态；再进行任意动作会恢复正常速度。下一个任务必须是“部署”、“技能”、“撤退”其中之一，此时会提前点开该干员，等待满足条件后再执行。`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'camera',
    accent: 'border-blue-700',
    accentText: 'text-blue-700 dark:text-blue-400',
    accentBg: 'bg-blue-700',
    title: '移动相机',
    shortTitle: '移动相机',
    value: CopilotDocV1.Type.MoveCamera,
    alternativeValue: '移动相机',
    description: `仅用于引航者试炼模式中切换区域`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'antenna',
    accent: 'border-violet-700',
    accentText: 'text-violet-700 dark:text-violet-400',
    accentBg: 'bg-violet-700',
    title: '开始挂机',
    shortTitle: '开始挂机',
    value: CopilotDocV1.Type.SkillDaemon,
    alternativeValue: '摆完挂机',
    description: `进入挂机模式。仅使用 “好了就用” 的技能，其他什么都不做，直到战斗结束`,
    group: '作战控制',
  },
  {
    type: 'choice',
    icon: 'paragraph',
    accent: 'border-fuchsia-700',
    accentText: 'text-fuchsia-700 dark:text-fuchsia-400',
    accentBg: 'bg-fuchsia-700',
    title: '打印描述内容',
    shortTitle: '打印内容',
    value: CopilotDocV1.Type.Output,
    alternativeValue: '打印',
    description: `对作战没有实际作用，仅用于输出描述内容（用来做字幕之类的）`,
    group: '杂项',
  },
]

export const ACTION_TYPES_BY_GROUP = groupBy(ACTION_TYPES, 'group')

export const validTypesFollowingBulletTime = [
  CopilotDocV1.Type.Deploy,
  CopilotDocV1.Type.Skill,
  CopilotDocV1.Type.Retreat,
]

const notFoundActionType: Omit<ActionType, 'value'> & { value: 'Unknown' } = {
  type: 'choice',
  icon: 'help',
  accent: 'border-zinc-700',
  accentText: 'text-zinc-700 dark:text-zinc-400',
  accentBg: 'bg-zinc-700',
  title: '未知动作',
  shortTitle: '未知动作',
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

export type ActionConditionType =
  | 'costs'
  | 'costChanges'
  | 'kills'
  | 'cooling'
  | 'intermediatePreDelay'
  | 'intermediatePostDelay'

export const ACTION_CONDITIONS: Record<
  ActionConditionType,
  { title: string; icon: IconName; description: string }
> = {
  // 注意这里 intermediatePreDelay/intermediatePostDelay 和动作里 preDelay/rearDelay 的含义是反过来的！！！
  // 主要是便于设计 UI 和易于让用户理解
  intermediatePreDelay: {
    title: '前置延迟',
    icon: 'time',
    description: '延迟一定时间后，开始检查其他条件',
  },
  intermediatePostDelay: {
    title: '后置延迟',
    icon: 'time',
    description: '所有条件全部满足后，延迟一定时间',
  },
  costs: {
    title: '费用',
    icon: 'dollar',
    description:
      '达到一定费用后开始执行。费用受潜能等影响，可能并不完全正确，仅适合对时间轴要求不严格的战斗，否则请使用费用变化量条件。仅在费用是两位数的时候识别的比较准，三位数的费用可能会识别错，不推荐使用。',
  },
  costChanges: {
    title: '费用变化量',
    icon: 'dollar',
    description:
      '从前一个动作结束时的费用开始计算，达到一定变化量后开始执行。支持负数，即费用变少了（例如“孑”等吸费干员使得费用变少了）。仅在费用是两位数的时候识别的比较准，三位数的费用可能会识别错，不推荐使用。',
  },
  kills: {
    title: '击杀数',
    icon: 'locate',
    description: '达到一定击杀数时开始执行',
  },
  cooling: {
    title: '冷却中的干员',
    icon: 'people',
    description: '冷却中的干员达到一定数量时开始执行',
  },
}
