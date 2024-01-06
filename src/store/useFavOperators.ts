import { CopilotDocV1 } from '../models/copilot.schema'
import { atomWithLocalStorage } from './storage'

type FavOperatorState = CopilotDocV1.Operator[]

export const favOperatorAtom = atomWithLocalStorage<
  FavOperatorState,
  FavOperatorState
>('maa-copilot-fav-operators', [])
