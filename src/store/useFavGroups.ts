import { atom } from 'jotai'

import { CopilotDocV1 } from '../models/copilot.schema'
import { atomWithLocalStorage } from './storage'

type FavGroupState = CopilotDocV1.Group[]

const favGroupCoreAtom = atomWithLocalStorage<FavGroupState, FavGroupState>(
  'maa-copilot-fav-groups',
  [],
)

export const favGroupAtom = atom(
  (get) => get(favGroupCoreAtom),
  (_get, set, value: FavGroupState) => {
    set(favGroupCoreAtom, value)
  },
)
