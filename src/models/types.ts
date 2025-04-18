import { IconName } from '@blueprintjs/core'

import i18n from '../i18n'
import { CopilotDocV1 } from './copilot.schema'

interface ActionType {
  type: 'choice'
  icon: IconName
  accent: string
  title: string
  value: CopilotDocV1.Type | 'Unknown'
  alternativeValue: string
  description: string
  group: string
}

const accent = {
  red: 'border-red-700',
  amber: 'border-amber-700',
  lime: 'border-lime-700',
  emerald: 'border-emerald-700',
  cyan: 'border-cyan-700',
  blue: 'border-blue-700',
  violet: 'border-violet-700',
  fuchsia: 'border-fuchsia-700',
  zinc: 'border-zinc-700',
}

export const ACTION_TYPES: ActionType[] = [
  {
    type: 'choice',
    icon: 'new-object',
    accent: accent.red,
    title: i18n.t('models.types.action_type.deploy.title'),
    value: CopilotDocV1.Type.Deploy,
    alternativeValue: i18n.t(
      'models.types.action_type.deploy.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.deploy.description'),
    group: i18n.t('models.types.action_group.operator_deploy_retreat'),
  },
  {
    type: 'choice',
    icon: 'graph-remove',
    accent: accent.amber,
    title: i18n.t('models.types.action_type.retreat.title'),
    value: CopilotDocV1.Type.Retreat,
    alternativeValue: i18n.t(
      'models.types.action_type.retreat.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.retreat.description'),
    group: i18n.t('models.types.action_group.operator_deploy_retreat'),
  },
  {
    type: 'choice',
    icon: 'target',
    accent: accent.lime,
    title: i18n.t('models.types.action_type.skill.title'),
    value: CopilotDocV1.Type.Skill,
    alternativeValue: i18n.t('models.types.action_type.skill.alternativeValue'),
    description: i18n.t('models.types.action_type.skill.description'),
    group: i18n.t('models.types.action_group.operator_skills'),
  },
  {
    type: 'choice',
    icon: 'swap-horizontal',
    accent: accent.emerald,
    title: i18n.t('models.types.action_type.skill_usage.title'),
    value: CopilotDocV1.Type.SkillUsage,
    alternativeValue: i18n.t(
      'models.types.action_type.skill_usage.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.skill_usage.description'),
    group: i18n.t('models.types.action_group.operator_skills'),
  },
  {
    type: 'choice',
    icon: 'fast-forward',
    accent: accent.cyan,
    title: i18n.t('models.types.action_type.speed_up.title'),
    value: CopilotDocV1.Type.SpeedUp,
    alternativeValue: i18n.t(
      'models.types.action_type.speed_up.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.speed_up.description'),
    group: i18n.t('models.types.action_group.battle_control'),
  },
  {
    type: 'choice',
    icon: 'fast-backward',
    accent: accent.blue,
    title: i18n.t('models.types.action_type.bullet_time.title'),
    value: CopilotDocV1.Type.BulletTime,
    alternativeValue: i18n.t(
      'models.types.action_type.bullet_time.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.bullet_time.description'),
    group: i18n.t('models.types.action_group.battle_control'),
  },
  {
    type: 'choice',
    icon: 'camera',
    accent: accent.blue,
    title: i18n.t('models.types.action_type.move_camera.title'),
    value: CopilotDocV1.Type.MoveCamera,
    alternativeValue: i18n.t(
      'models.types.action_type.move_camera.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.move_camera.description'),
    group: i18n.t('models.types.action_group.battle_control'),
  },
  {
    type: 'choice',
    icon: 'antenna',
    accent: accent.violet,
    title: i18n.t('models.types.action_type.skill_daemon.title'),
    value: CopilotDocV1.Type.SkillDaemon,
    alternativeValue: i18n.t(
      'models.types.action_type.skill_daemon.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.skill_daemon.description'),
    group: i18n.t('models.types.action_group.battle_control'),
  },
  {
    type: 'choice',
    icon: 'paragraph',
    accent: accent.fuchsia,
    title: i18n.t('models.types.action_type.output.title'),
    value: CopilotDocV1.Type.Output,
    alternativeValue: i18n.t(
      'models.types.action_type.output.alternativeValue',
    ),
    description: i18n.t('models.types.action_type.output.description'),
    group: i18n.t('models.types.action_group.miscellaneous'),
  },
]

export const validTypesFollowingBulletTime = [
  CopilotDocV1.Type.Deploy,
  CopilotDocV1.Type.Skill,
  CopilotDocV1.Type.Retreat,
]

const notFoundActionType: ActionType = {
  type: 'choice',
  icon: 'help',
  accent: accent.zinc,
  title: i18n.t('models.types.action_type.unknown.title'),
  value: 'Unknown',
  alternativeValue: i18n.t('models.types.action_type.unknown.alternativeValue'),
  description: i18n.t('models.types.action_type.unknown.description'),
  group: i18n.t('models.types.action_group.unknown'),
}

export const findActionType = (type?: string) => {
  if (!type) return notFoundActionType
  return (
    ACTION_TYPES.find(
      (item) => item.value === type || item.alternativeValue === type,
    ) || notFoundActionType
  )
}
