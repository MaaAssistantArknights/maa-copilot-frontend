import { useAtomValue } from 'jotai'

import { OperatorInfo as ModelsOperator, OPERATORS } from 'models/operator'
import { favOperatorAtom } from 'store/useFavOperators'

import { useSheet } from '../SheetProvider'

type OperatorInfo = ModelsOperator

export enum DEFAULTPROFID {
  ALL = 'allProf',
  FAV = 'favProf',
  OTHERS = 'othersProf',
}

export enum DEFAULTSUBPROFID {
  ALL = 'allSubProf',
  SELECTED = 'selectedProf',
}

export interface ProfFilter {
  selectedProf: [DEFAULTPROFID, DEFAULTSUBPROFID]
}

export interface RarityFilter {
  selectedRarity: number[]
  reverse: boolean
}

export interface PaginationFilter {
  size: number
  current: number
  total: number
}

export const useOperatorAfterFiltered = (profFilter: ProfFilter) => {
  const { existedOperators } = useSheet()
  const favOperators = useAtomValue(favOperatorAtom)
  // Priority: prof > sub prof > rarity/rarityReverse

  return OPERATORS
}

const profFilterHandle = (
  profFilter: ProfFilter = {
    selectedProf: [DEFAULTPROFID.ALL, DEFAULTSUBPROFID.ALL],
  },
  originData: OperatorInfo[] = OPERATORS,
) => {
  if (!profFilter) return originData
  const {
    selectedProf: [_, subProf],
  } = profFilter

  return originData.filter(
    ({ subProf: operatorSubProf }) => operatorSubProf === subProf,
  )
}
