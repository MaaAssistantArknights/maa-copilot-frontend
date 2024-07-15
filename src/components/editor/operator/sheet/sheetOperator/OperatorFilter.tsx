import { OPERATORS } from 'models/operator'

import { useSheet } from '../SheetProvider'

interface RarityFilter {
  selectedRarity: number[]
  reverse: boolean
}

interface PaginationFilter {
  size: number
  current: number
  total: number
}

export const useOperatorAfterFiltered = () => {
  const { existedOperators } = useSheet()
  return OPERATORS
}
