import { CopilotDocV1 } from '../models/copilot.schema'
import { atomWithLocalStorage } from './storage'

type FavGroupState = CopilotDocV1.Group[]

export const favGroupAtom = atomWithLocalStorage<FavGroupState, FavGroupState>(
  'maa-copilot-fav-groups',
  [],
)
