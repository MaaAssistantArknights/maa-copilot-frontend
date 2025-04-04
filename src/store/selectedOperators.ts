import { atomWithStorage } from 'jotai/utils'

export interface OperatorFilterData {
  included: string[]
  excluded: string[]
  enabled: boolean
  save: boolean
}

export const DEFAULT_OPERATOR_FILTER: OperatorFilterData = {
  included: [],
  excluded: [],
  enabled: true,
  save: true,
}

export const operatorFilterAtom = atomWithStorage<OperatorFilterData>(
  'maa-copilot-operatorFilter',
  DEFAULT_OPERATOR_FILTER,
  undefined,
  { getOnInit: true },
)

// 删除旧版数据
if (localStorage.getItem('maa-copilot-selectedOperators')) {
  localStorage.removeItem('maa-copilot-selectedOperators')
  localStorage.removeItem('maa-copilot-saveSelectedOperators')
}
