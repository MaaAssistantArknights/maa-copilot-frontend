import {
  DetailedSelectChoice,
  DetailedSelectItem,
  isChoice,
} from '../components/editor/DetailedSelect'

const defaultValue: CopilotDocV1.SkillUsageType = 0

export type DetailedOperatorSkillUsage = DetailedSelectChoice

export const operatorSkillUsages: DetailedSelectItem[] = [
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
    title: '好了就用，有多少次用多少次',
    value: 1,
    description: '例如：棘刺 3 技能、桃金娘 1 技能等',
  },
  {
    type: 'choice',
    icon: 'circle',
    title: '好了就用，仅使用一次',
    value: 2,
    description: '例如：山 2 技能',
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

export function findOperatorSkillUsage(
  value: number = defaultValue,
): DetailedOperatorSkillUsage | undefined {
  return operatorSkillUsages
    .filter(isChoice)
    .find((item) => item.value === value)
}
