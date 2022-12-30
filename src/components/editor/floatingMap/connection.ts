import { Message } from '../../../utils/messenger'

// const MAP_SITE = 'https://theresa.wiki'
export const MAP_SITE = 'http://localhost:3001'

export const getMapUrl = (stageId: string) =>
  `http://localhost:3001/widget/map/main_00-01/scene`
// `${MAP_SITE}/widget/map/${stageId}/scene`

export type MapReadyMessage = Message<'mapReady'>

export type TileClickMessage = Message<
  'tileClick',
  {
    index: number
    width: number
    height: number
    maaLocation: [x: number, y: number]
    tile: IMapDataTiles
  }
>

export type SetMapStateMessage = Message<
  'setMapState',
  { activeTiles: { x: number; y: number }[] }
>

// types defined in Theresa-wiki

export interface IMapDataTiles {
  blackboard: unknown
  buildableType: unknown
  effects: unknown
  heightType: unknown
  passableMask: unknown
  tileKey: string
}
