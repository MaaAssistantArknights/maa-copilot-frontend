import { Level } from '../../../models/operation'
import { envUseProductionTheresa } from '../../../utils/envvar'
import { Message } from '../../../utils/messenger'

export const MAP_SITE = envUseProductionTheresa
  ? 'https://theresa.wiki'
  : 'http://localhost:3001'

export const getMapUrl = (level: Level) =>
  `${MAP_SITE}/widget/map/${level.stageId}/scene`

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
