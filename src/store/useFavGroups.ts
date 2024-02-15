import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { omit } from 'lodash-es'

import { CopilotDocV1 } from '../models/copilot.schema'
import { authAtom } from './auth'

const DEFAULTGROUPUSER = 'none_login_user'
export const ignoreKeyDic = ['_id', 'id']
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
    const omitFavGroup = favGroups.map((item) =>
      omit(item, ignoreKeyDic),
    ) as Group[]
    const { userId = DEFAULTGROUPUSER } = _get(authAtom)
    const oldFavGroup = [..._get(favGroupCoreAtom)]
    const existedFavGroupIndex = oldFavGroup.findIndex(
      (item) => item.userId === userId,
    )
    if (existedFavGroupIndex === -1)
      set(favGroupCoreAtom, [
        ...oldFavGroup,
        { userId, favGroups: omitFavGroup },
      ])
    else {
      oldFavGroup.splice(existedFavGroupIndex, 1, {
        userId,
        favGroups: omitFavGroup,
      })
      set(favGroupCoreAtom, oldFavGroup)
    }
  },
)
