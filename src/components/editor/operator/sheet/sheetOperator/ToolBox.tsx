import { Dispatch, FC, SetStateAction } from 'react'

import { RarityFilter } from './SheetOperatorFilterProvider'

export interface ToolBoxProp {
  toTop: () => void
  rarityFilter: RarityFilter
  setRarityFilter: Dispatch<SetStateAction<RarityFilter>>
}

export const ToolBox: FC<ToolBoxProp> = ({
  toTop,
  rarityFilter,
  setRarityFilter,
}) => {
  return <>111</>
}
