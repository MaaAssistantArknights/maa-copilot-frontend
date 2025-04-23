import { IconName } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { clamp, defaults } from 'lodash-es'

import { CopilotDocV1 } from 'models/copilot.schema'

import {
  DetailedSelectChoice,
  isChoice,
} from '../components/editor/DetailedSelect'
import { Language, i18n, i18nDefer, languageAtom } from '../i18n/i18n'
import { OPERATORS, PROFESSIONS } from '../models/generated/operators.json'

export { OPERATORS, PROFESSIONS }

export type OperatorInfo = (typeof OPERATORS)[number]
export type Profession = (typeof PROFESSIONS)[number]

const OPERATORS_BY_ID = Object.fromEntries(
  OPERATORS.map((operator) => [operator.id, operator]),
)
export function findOperatorById(id: string): OperatorInfo | undefined {
  return OPERATORS_BY_ID[id]
}

const OPERATORS_BY_NAME = Object.fromEntries(
  OPERATORS.map((operator) => [operator.name, operator]),
)
export function findOperatorByName(name: string): OperatorInfo | undefined {
  return OPERATORS_BY_NAME[name]
}

const defaultSkillUsage = CopilotDocV1.SkillUsageType.None

export type DetailedOperatorSkillUsage = DetailedSelectChoice & {
  shortTitle: string
}

export const defaultSkills: OperatorInfo['skills'] = [
  '一技能',
  '二技能',
  '三技能',
]

const defaultRequirementsByRarity: Record<
  number,
  Required<CopilotDocV1.Requirements>
> = {
  0: { potentiality: 1, module: 0, elite: 0, level: 1, skillLevel: 1 },
  1: { potentiality: 1, module: 0, elite: 0, level: 30, skillLevel: 1 },
  2: { potentiality: 1, module: 0, elite: 0, level: 30, skillLevel: 1 },
  3: { potentiality: 1, module: 0, elite: 1, level: 55, skillLevel: 7 },
  4: { potentiality: 1, module: 0, elite: 1, level: 70, skillLevel: 7 },
  5: { potentiality: 1, module: 0, elite: 2, level: 40, skillLevel: 7 },
  6: { potentiality: 1, module: 0, elite: 2, level: 60, skillLevel: 10 },
}

export function getDefaultRequirements(rarity = 6) {
  return defaultRequirementsByRarity[rarity] ?? defaultRequirementsByRarity[6]
}

export function withDefaultRequirements(
  baseRequirements: CopilotDocV1.Requirements = {},
  rarity = 6,
): Required<CopilotDocV1.Requirements> {
  const defaultRequirements = getDefaultRequirements(rarity)
  return defaults({}, baseRequirements, defaultRequirements)
}

export function adjustOperatorLevel({
  // 未知稀有度按6星算
  rarity = 6,
  elite,
  level,
  adjustment,
}: {
  rarity?: number
  elite: number
  level: number
  adjustment: number
}) {
  const elite1 = 50
  const elite2 = elite1 + 70
  const maxLevel =
    rarity === 6
      ? elite2 + 90
      : rarity === 5
        ? elite2 + 80
        : rarity === 4
          ? elite2 + 70
          : rarity === 3
            ? elite1 + 55
            : 30
  if (elite === 1) {
    level += elite1
  } else if (elite === 2) {
    level += elite2
  }
  level += adjustment
  // 向 adjustment 的绝对值取整，如果 adjustment=±10，就可以得到整十的等级
  level =
    (adjustment < 0 ? Math.ceil : Math.floor)(level / Math.abs(adjustment)) *
    Math.abs(adjustment)

  level = clamp(level, 1, maxLevel)
  if (level > elite2) {
    elite = 2
    level -= elite2
  } else if (level > elite1) {
    elite = 1
    level -= elite1
  } else {
    elite = 0
  }
  return { elite, level }
}

export const operatorSkillUsages: DetailedOperatorSkillUsage[] = [
  {
    type: 'choice',
    icon: 'disable',
    title: i18nDefer.models.operator.skill_usage.none_title,
    shortTitle: '不自动使用',
    value: CopilotDocV1.SkillUsageType.None,
    description: i18nDefer.models.operator.skill_usage.none_description,
  },
  {
    type: 'choice',
    icon: 'automatic-updates',
    title: i18nDefer.models.operator.skill_usage.ready_to_use_title,
    shortTitle: '好了就用',
    value: CopilotDocV1.SkillUsageType.ReadyToUse,
    description: i18nDefer.models.operator.skill_usage.ready_to_use_description,
  },
  {
    type: 'choice',
    icon: 'circle',
    title: i18nDefer.models.operator.skill_usage.ready_to_use_times_title,
    shortTitle: '好了就用',
    value: CopilotDocV1.SkillUsageType.ReadyToUseTimes,
    description:
      i18nDefer.models.operator.skill_usage.ready_to_use_times_description,
  },
  {
    type: 'choice',
    icon: 'predictive-analysis',
    title: i18nDefer.models.operator.skill_usage.automatically_title,
    shortTitle: '自动判断使用时机',
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
  shortTitle: '未知用法',
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
          count: skillTimes,
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
    title: i18nDefer.models.operator.color.gray,
    value: 'Gray',
  },
  {
    title: i18nDefer.models.operator.color.black,
    value: 'Black',
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

export function getLocalizedOperatorName(name: string, lang: Language): string {
  const operator = OPERATORS.find((op) => op.name === name)
  if (!operator) return name
  return lang === 'en' ? operator.name_en : operator.name
}

export function useLocalizedOperatorName(name: string): string {
  const lang = useAtomValue(languageAtom)
  return getLocalizedOperatorName(name, lang)
}
