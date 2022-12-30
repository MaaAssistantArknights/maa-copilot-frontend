import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

import { useMessage } from '../../../utils/messenger'
import { MAP_SITE, TileClickMessage } from './connection'

export interface MapTile {
  x: number
  y: number
}

export interface IFloatingMapContext {
  levelId?: string
  setLevelId: (id?: string) => void
  activeTiles: MapTile[]
  setActiveTiles: (tiles: MapTile[]) => void
}

const FloatingMapContextObject = createContext<IFloatingMapContext>({} as any)

export function useFloatingMap() {
  return useContext(FloatingMapContextObject)
}

export function FloatingMapContext({ children }: { children: ReactNode }) {
  const [levelId, setLevelId] = useState<string>()
  const [activeTiles, setActiveTiles] = useState<MapTile[]>([])

  const value = useMemo(
    () => ({
      levelId,
      setLevelId,
      activeTiles,
      setActiveTiles,
    }),
    [levelId, activeTiles],
  )

  useMessage<TileClickMessage>(MAP_SITE, 'tileClick', (e) => {
    const [x, y] = e.message.data.maaLocation
    setActiveTiles([{ x, y }])
  })

  return (
    <FloatingMapContextObject.Provider value={value}>
      {children}
    </FloatingMapContextObject.Provider>
  )
}
