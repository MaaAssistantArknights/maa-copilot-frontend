import { atomWithStorage } from 'jotai/utils'

export const selectedOperatorsAtom = atomWithStorage(
  'maa-copilot-selectedOperators',
  [] as string[],
)

export const shouldSaveSelectedOperatorsAtom = atomWithStorage(
  'maa-copilot-saveSelectedOperators',
  true,
)
