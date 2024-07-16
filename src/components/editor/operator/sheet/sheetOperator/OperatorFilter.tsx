import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

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
  selectedProf: [string, string]
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

const generateCustomizedOperInfo = (name: string): OperatorInfo => ({
  id: 'customized-' + name,
  name,
  prof: 'TOKEN',
  subProf: 'customized',
  alias: 'customized-operator',
  rarity: 0,
  alt_name: 'custormized operator',
})

export const useOperatorAfterFiltered = (profFilter: ProfFilter) => {
  // Priority: prof > sub prof > rarity/rarityReverse
  // filterResult init and prof filter about
  const filterResult: { name: string }[] = useProfFilterHandle(profFilter)
  //   rarity about

  //   filterResult
  console.log(filterResult)
  return filterResult
}

const useProfFilterHandle = (
  profFilter: ProfFilter = {
    selectedProf: [DEFAULTPROFID.ALL, DEFAULTSUBPROFID.ALL],
  },
) => {
  const {
    selectedProf: [prof, subProf],
  } = profFilter
  const { existedOperators } = useSheet()

  const favOperators = useAtomValue(favOperatorAtom)
  const customizedOperatorsInfo = useMemo<OperatorInfo[]>(
    () =>
      existedOperators
        .map(({ name }) =>
          OPERATORS.find(({ name: OPERName }) => OPERName === name)
            ? undefined
            : generateCustomizedOperInfo(name),
        )
        .filter((item) => !!item),
    [existedOperators],
  )
  const favOperatorsInfo = useMemo<OperatorInfo[]>(
    () =>
      favOperators.map(
        ({ name }) =>
          OPERATORS.find(({ name: OPERName }) => OPERName === name) ||
          generateCustomizedOperInfo(name),
      ),
    [favOperators],
  )

  let operatorsFilteredByProf: OperatorInfo[] = []
  const OPERATORSWITHINCUSTOMIZED = [...OPERATORS, ...customizedOperatorsInfo]
  switch (prof) {
    case DEFAULTPROFID.ALL: {
      operatorsFilteredByProf = OPERATORSWITHINCUSTOMIZED
      break
    }
    case DEFAULTPROFID.FAV: {
      operatorsFilteredByProf = favOperatorsInfo
      break
    }
    case DEFAULTPROFID.OTHERS: {
      operatorsFilteredByProf = OPERATORSWITHINCUSTOMIZED.filter(
        ({ prof }) => prof === 'TOKEN',
      )
      break
    }

    default: {
      operatorsFilteredByProf = OPERATORSWITHINCUSTOMIZED.filter(
        ({ prof: OPERProf }) => OPERProf === prof,
      )
      break
    }
  }

  switch (subProf) {
    case DEFAULTSUBPROFID.ALL: {
      return operatorsFilteredByProf
    }
    case DEFAULTSUBPROFID.SELECTED: {
      return operatorsFilteredByProf.filter(
        ({ name }) =>
          !!existedOperators.find(
            ({ name: existedName }) => existedName === name,
          ),
      )
    }
    default: {
      return operatorsFilteredByProf.filter(
        ({ subProf: operatorSubProf }) => operatorSubProf === subProf,
      )
    }
  }
}
