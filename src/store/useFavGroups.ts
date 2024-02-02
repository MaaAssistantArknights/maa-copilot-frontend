import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { CopilotDocV1 } from '../models/copilot.schema'
import { authAtom } from './auth'

const DEFAULTGROUPUSER = 'none_login_user'
type Group = CopilotDocV1.Group
interface FavGroupState {
  userId: string
  favGroups: Group[]
}
const favGroupCoreAtom = atomWithStorage<FavGroupState[]>(
  'maa-copilot-fav-groups',
  [],
)

export const favGroupAtom = atom(
  (get) =>
    get(favGroupCoreAtom).find(
      (item) => item.userId === (get(authAtom).userId || DEFAULTGROUPUSER),
    )?.favGroups || ([] as Group[]),
  (_get, set, favGroups: Group[]) => {
    const { userId = DEFAULTGROUPUSER } = _get(authAtom)
    const oldFavGroup = [..._get(favGroupCoreAtom)]
    const existedFavGroupIndex = oldFavGroup.findIndex(
      (item) => item.userId === userId,
    )
    if (existedFavGroupIndex === -1)
      set(favGroupCoreAtom, [...oldFavGroup, { userId, favGroups }])
    else {
      oldFavGroup.splice(existedFavGroupIndex, 1, { userId, favGroups })
      set(favGroupCoreAtom, oldFavGroup)
    }
  },
)
