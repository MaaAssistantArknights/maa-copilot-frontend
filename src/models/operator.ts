import { IconName } from '@blueprintjs/core'
import {
  DetailedSelectChoice,
  DetailedSelectItem,
  isChoice,
} from '../components/editor/DetailedSelect'

const defaultSkillUsage: CopilotDocV1.SkillUsageType = 0

export type DetailedOperatorSkillUsage = DetailedSelectChoice

export const operatorSkillUsages: readonly DetailedSelectItem[] = [
  {
    type: 'choice',
    icon: 'disable',
    title: '不自动使用',
    value: 0,
    description:
      '不由 MAA Copilot 自动开启技能、或干员技能并不需要操作开启（自动触发）。若需要手动开启技能，请添加「使用技能」动作',
  },
  {
    type: 'choice',
    icon: 'automatic-updates',
    title: '好了就用',
    value: 1,
    description: '有多少次用多少次，例如：棘刺 3 技能、桃金娘 1 技能等',
  },
  {
    type: 'choice',
    icon: 'circle',
    title: '好了就用（一次）',
    value: 2,
    description: '仅使用一次，例如：山 2 技能',
  },
  {
    type: 'choice',
    icon: 'predictive-analysis',
    title: '自动判断使用时机',
    value: 3,
    description: '(锐意开发中) 画饼.jpg',
    disabled: true,
  },
]

const unknownSkillUsage: DetailedOperatorSkillUsage = {
  type: 'choice',
  icon: 'error',
  title: '未知用法',
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
    operatorDirections.find((item) => item.value === value) || unknownDirection
  )
}
