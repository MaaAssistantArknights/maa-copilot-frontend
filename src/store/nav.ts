import { atom } from 'jotai'

interface NavState {
  expanded?: boolean
}

export const navAtom = atom<NavState>({
  expanded: false,
})

export const toggleExpandNavAtom = atom(null, (get, set, value) => {
  set(navAtom, {
    ...get(navAtom),
    expanded: !get(navAtom).expanded,
  })
})
