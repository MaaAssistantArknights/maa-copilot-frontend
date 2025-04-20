import { IconName } from '@blueprintjs/core'

import { clamp, defaults } from 'lodash-es'

import { CopilotDocV1 } from 'models/copilot.schema'

import {
  DetailedSelectChoice,
  isChoice,
} from '../components/editor/DetailedSelect'
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
    title: '不自动使用',
    shortTitle: '不自动使用',
    value: CopilotDocV1.SkillUsageType.None,
    description:
      '不由 MAA Copilot 自动开启技能、或干员技能并不需要操作开启（自动触发）。若需要手动开启技能，请添加「使用技能」动作',
  },
  {
    type: 'choice',
    icon: 'automatic-updates',
    title: '好了就用',
    shortTitle: '好了就用',
    value: CopilotDocV1.SkillUsageType.ReadyToUse,
    description: '有多少次用多少次，例如：棘刺 3 技能、桃金娘 1 技能等',
  },
  {
    type: 'choice',
    icon: 'circle',
    title: '好了就用（指定次数）',
    shortTitle: '好了就用',
    value: CopilotDocV1.SkillUsageType.ReadyToUseTimes,
    description: '默认仅使用一次，例如：山 2 技能',
  },
  {
    type: 'choice',
    icon: 'predictive-analysis',
    title: '自动判断使用时机',
    shortTitle: '自动判断使用时机',
    value: CopilotDocV1.SkillUsageType.Automatically,
    description: '(锐意开发中) 画饼.jpg',
    disabled: true,
  },
]

const unknownSkillUsage: DetailedOperatorSkillUsage = {
  type: 'choice',
  icon: 'error',
  title: '未知用法',
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
    return `好了就用（${skillTimes ? `${skillTimes}次` : '指定次数'}）`
  }
  return findOperatorSkillUsage(skillUsage).title
}

export interface OperatorDirection {
  icon?: IconName
  title: string
  value: CopilotDocV1.Direction | null
}

const defaultDirection: CopilotDocV1.Direction =
  'None' as CopilotDocV1.Direction.None

export const operatorDirections: OperatorDirection[] = [
  // TODO: remove these string literals when CopilotDocV1 can be imported
  {
    icon: 'slash',
    title: '无',
    value: 'None' as CopilotDocV1.Direction.None,
  },
  {
    icon: 'arrow-up',
    title: '上',
    value: 'Up' as CopilotDocV1.Direction.Up,
  },
  {
    icon: 'arrow-down',
    title: '下',
    value: 'Down' as CopilotDocV1.Direction.Down,
  },
  {
    icon: 'arrow-left',
    title: '左',
    value: 'Left' as CopilotDocV1.Direction.Left,
  },
  {
    icon: 'arrow-right',
    title: '右',
    value: 'Right' as CopilotDocV1.Direction.Right,
  },
]

const unknownDirection: OperatorDirection = {
  icon: 'error',
  title: '未知方向',
  value: null,
}

export function findOperatorDirection(
  value: CopilotDocV1.Direction = defaultDirection,
): OperatorDirection {
  return (
    operatorDirections.find(
      (item) => item.value === value || item.title === value,
    ) || unknownDirection
  )
}

export interface ActionDocColor {
  title: string
  value: string
}

// Colors from
// https://github.com/MaaAssistantArknights/MaaAssistantArknights/blob/50f5f94dfcc2ec175556bbaa55d0ffec74128a8e/src/MeoAsstGui/Helper/LogColor.cs
export const actionDocColors: ActionDocColor[] = [
  {
    title: '黑色',
    value: 'Black',
  },
  {
    title: '灰色',
    value: 'Gray',
  },
  {
    title: '红色',
    value: 'DarkRed',
  },
  {
    title: '橙色',
    value: 'DarkGoldenrod',
  },
  {
    title: '黄色',
    value: 'Gold',
  },
  {
    title: '绿色',
    value: 'SpringGreen',
  },
  {
    title: '青色',
    value: 'DarkCyan',
  },
  {
    title: '蓝色',
    value: 'DeepSkyBlue',
  },
  {
    title: '紫色',
    value: '#6f42c1',
  },
  {
    title: '粉色',
    value: '#d63384',
  },
]
