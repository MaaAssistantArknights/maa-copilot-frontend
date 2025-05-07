import { IconName } from '@blueprintjs/core'

import { CopilotDocV1 } from 'models/copilot.schema'

import {
  DetailedSelectChoice,
  DetailedSelectItem,
  isChoice,
} from '../components/editor/DetailedSelect'
import { i18n, i18nDefer } from '../i18n/i18n'
import { OPERATORS, PROFESSIONS } from '../models/generated/operators.json'

export { OPERATORS, PROFESSIONS }

const defaultSkillUsage = CopilotDocV1.SkillUsageType.None

export type DetailedOperatorSkillUsage = DetailedSelectChoice

export type OperatorInfo = (typeof OPERATORS)[number]

export type Profession = (typeof PROFESSIONS)[number]

export const operatorSkillUsages: readonly DetailedSelectItem[] = [
  {
    type: 'choice',
    icon: 'disable',
    title: i18nDefer.models.operator.skill_usage.none_title,
    value: CopilotDocV1.SkillUsageType.None,
    description: i18nDefer.models.operator.skill_usage.none_description,
  },
  {
    type: 'choice',
    icon: 'automatic-updates',
    title: i18nDefer.models.operator.skill_usage.ready_to_use_title,
    value: CopilotDocV1.SkillUsageType.ReadyToUse,
    description: i18nDefer.models.operator.skill_usage.ready_to_use_description,
  },
  {
    type: 'choice',
    icon: 'circle',
    title: i18nDefer.models.operator.skill_usage.ready_to_use_times_title,
    value: CopilotDocV1.SkillUsageType.ReadyToUseTimes,
    description:
      i18nDefer.models.operator.skill_usage.ready_to_use_times_description,
  },
  {
    type: 'choice',
    icon: 'predictive-analysis',
    title: i18nDefer.models.operator.skill_usage.automatically_title,
    value: CopilotDocV1.SkillUsageType.Automatically,
    description:
      i18nDefer.models.operator.skill_usage.automatically_description,
    disabled: true,
  },
]

const unknownSkillUsage: DetailedOperatorSkillUsage = {
  type: 'choice',
  icon: 'error',
  title: i18nDefer.models.operator.skill_usage.unknown_title,
  value: -1,
  description: '',
}

export function findOperatorSkillUsage(
  value: number = defaultSkillUsage,
): DetailedOperatorSkillUsage {
  return (
    operatorSkillUsages.filter(isChoice).find((item) => item.value === value) ||
    unknownSkillUsage
  )
}

export function getSkillUsageTitle(
  skillUsage: CopilotDocV1.SkillUsageType,
  skillTimes?: CopilotDocV1.SkillTimes,
) {
  if (skillUsage === CopilotDocV1.SkillUsageType.ReadyToUseTimes) {
    return skillTimes
      ? i18n.models.operator.skill_usage.format_times({
          times: skillTimes,
        })
      : i18n.models.operator.skill_usage.format_specific_times
  }
  const title = findOperatorSkillUsage(skillUsage).title
  return typeof title === 'function' ? title() : title
}

export interface OperatorDirection {
  icon?: IconName
  title: () => string
  value: CopilotDocV1.Direction | null
}

const defaultDirection: CopilotDocV1.Direction =
  'None' as CopilotDocV1.Direction.None

export const operatorDirections: OperatorDirection[] = [
  // TODO: remove these string literals when CopilotDocV1 can be imported
  {
    icon: 'slash',
    title: i18nDefer.models.operator.direction.none,
    value: 'None' as CopilotDocV1.Direction.None,
  },
  {
    icon: 'arrow-up',
    title: i18nDefer.models.operator.direction.up,
    value: 'Up' as CopilotDocV1.Direction.Up,
  },
  {
    icon: 'arrow-down',
    title: i18nDefer.models.operator.direction.down,
    value: 'Down' as CopilotDocV1.Direction.Down,
  },
  {
    icon: 'arrow-left',
    title: i18nDefer.models.operator.direction.left,
    value: 'Left' as CopilotDocV1.Direction.Left,
  },
  {
    icon: 'arrow-right',
    title: i18nDefer.models.operator.direction.right,
    value: 'Right' as CopilotDocV1.Direction.Right,
  },
]

const unknownDirection: OperatorDirection = {
  icon: 'error',
  title: i18nDefer.models.operator.direction.unknown,
  value: null,
}

export function findOperatorDirection(
  value: CopilotDocV1.Direction = defaultDirection,
): OperatorDirection {
  return (
    operatorDirections.find((item) => item.value === value) || unknownDirection
  )
}

export interface ActionDocColor {
  title: () => string
  value: string
}

// Colors from
// https://github.com/MaaAssistantArknights/MaaAssistantArknights/blob/50f5f94dfcc2ec175556bbaa55d0ffec74128a8e/src/MeoAsstGui/Helper/LogColor.cs
export const actionDocColors: ActionDocColor[] = [
  {
    title: i18nDefer.models.operator.color.black,
    value: 'Black',
  },
  {
    title: i18nDefer.models.operator.color.gray,
    value: 'Gray',
  },
  {
    title: i18nDefer.models.operator.color.dark_red,
    value: 'DarkRed',
  },
  {
    title: i18nDefer.models.operator.color.dark_goldenrod,
    value: 'DarkGoldenrod',
  },
  {
    title: i18nDefer.models.operator.color.gold,
    value: 'Gold',
  },
  {
    title: i18nDefer.models.operator.color.spring_green,
    value: 'SpringGreen',
  },
  {
    title: i18nDefer.models.operator.color.dark_cyan,
    value: 'DarkCyan',
  },
  {
    title: i18nDefer.models.operator.color.deep_sky_blue,
    value: 'DeepSkyBlue',
  },
  {
    title: i18nDefer.models.operator.color.purple,
    value: '#6f42c1',
  },
  {
    title: i18nDefer.models.operator.color.pink,
    value: '#d63384',
  },
]
