import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

interface OperatorEntry {
  name: string
  exclude?: boolean
}

export const selectedOperatorsAtom = atomWithStorage(
  'maa-copilot-selectedOperators',
  [] as string[],
)

export const selectedOperatorQueryAtom = atom((get) => {
  const operators = get(selectedOperatorsAtom)
  return operators.join(',')
})
