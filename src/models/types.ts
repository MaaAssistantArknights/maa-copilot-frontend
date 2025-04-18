import { IconName } from '@blueprintjs/core'

import { i18nDefer } from '../i18n/i18n'
import { groupBy } from 'lodash-es'

import { CopilotDocV1 } from './copilot.schema'

interface ActionType {
  type: 'choice'
  icon: IconName
  accent: string
  accentText: string
  title: () => string
  shortTitle: string
  value: CopilotDocV1.Type
  alternativeValue: string
  description: () => string
  group: () => string
}
export const ACTION_TYPES: ActionType[] = [
  {
    type: 'choice',
    icon: 'new-object',
    accent: 'border-red-700',
    accentText: 'text-red-700 dark:text-red-400',
    title: i18nDefer.models.types.action_type.deploy.title,
    shortTitle: '部署',
    value: CopilotDocV1.Type.Deploy,
    alternativeValue: '部署',
    description: i18nDefer.models.types.action_type.deploy.description,
    group: i18nDefer.models.types.action_group.operator_deploy_retreat,
  },
  {
    type: 'choice',
    icon: 'graph-remove',
    accent: 'border-amber-700',
    accentText: 'text-amber-700 dark:text-amber-400',
    title: i18nDefer.models.types.action_type.retreat.title,
    shortTitle: '撤退',
    value: CopilotDocV1.Type.Retreat,
    alternativeValue: '撤退',
    description: i18nDefer.models.types.action_type.retreat.description,
    group: i18nDefer.models.types.action_group.operator_deploy_retreat,
  },
  {
    type: 'choice',
    icon: 'target',
    accent: 'border-lime-700',
    accentText: 'text-lime-700 dark:text-lime-400',
    title: i18nDefer.models.types.action_type.skill.title,
    shortTitle: '使用技能',
    value: CopilotDocV1.Type.Skill,
    alternativeValue: '技能',
    description: i18nDefer.models.types.action_type.skill.description,
    group: i18nDefer.models.types.action_group.operator_skills,
  },
  {
    type: 'choice',
    icon: 'swap-horizontal',
    accent: 'border-emerald-700',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    title: i18nDefer.models.types.action_type.skill_usage.title,
    shortTitle: '技能用法',
    value: CopilotDocV1.Type.SkillUsage,
    alternativeValue: '技能用法',
    description: i18nDefer.models.types.action_type.skill_usage.description,
    group: i18nDefer.models.types.action_group.operator_skills,
  },
  {
    type: 'choice',
    icon: 'fast-forward',
    accent: 'border-cyan-700',
    accentText: 'text-cyan-700 dark:text-cyan-400',
    title: i18nDefer.models.types.action_type.speed_up.title,
    shortTitle: '二倍速',
    value: CopilotDocV1.Type.SpeedUp,
    alternativeValue: '二倍速',
    description: i18nDefer.models.types.action_type.speed_up.description,
    group: i18nDefer.models.types.action_group.battle_control,
  },
  {
    type: 'choice',
    icon: 'fast-backward',
    accent: 'border-blue-700',
    accentText: 'text-blue-700 dark:text-blue-400',
    title: i18nDefer.models.types.action_type.bullet_time.title,
    shortTitle: '子弹时间',
    value: CopilotDocV1.Type.BulletTime,
    alternativeValue: '子弹时间',
    description: i18nDefer.models.types.action_type.bullet_time.description,
    group: i18nDefer.models.types.action_group.battle_control,
  },
  {
    type: 'choice',
    icon: 'camera',
    accent: 'border-blue-700',
    accentText: 'text-blue-700 dark:text-blue-400',
    title: i18nDefer.models.types.action_type.move_camera.title,
    shortTitle: '移动相机',
    value: CopilotDocV1.Type.MoveCamera,
    alternativeValue: '移动相机',
    description: i18nDefer.models.types.action_type.move_camera.description,
    group: i18nDefer.models.types.action_group.battle_control,
  },
  {
    type: 'choice',
    icon: 'antenna',
    accent: 'border-violet-700',
    accentText: 'text-violet-700 dark:text-violet-400',
    title: i18nDefer.models.types.action_type.skill_daemon.title,
    shortTitle: '开始挂机',
    value: CopilotDocV1.Type.SkillDaemon,
    alternativeValue: '摆完挂机',
    description: i18nDefer.models.types.action_type.skill_daemon.description,
    group: i18nDefer.models.types.action_group.battle_control,
  },
  {
    type: 'choice',
    icon: 'paragraph',
    accent: 'border-fuchsia-700',
    accentText: 'text-fuchsia-700 dark:text-fuchsia-400',
    title: i18nDefer.models.types.action_type.output.title,
    shortTitle: '打印内容',
    value: CopilotDocV1.Type.Output,
    alternativeValue: '打印',
    description: i18nDefer.models.types.action_type.output.description,
    group: i18nDefer.models.types.action_group.miscellaneous,
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
  title: i18nDefer.models.types.action_type.unknown.title,
  shortTitle: '未知动作',
  value: 'Unknown',
  alternativeValue: '',
  description: i18nDefer.models.types.action_type.unknown.description,
  group: i18nDefer.models.types.action_group.unknown,
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
