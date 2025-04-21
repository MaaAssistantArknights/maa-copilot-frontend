import { NonIdealState, Spinner } from '@blueprintjs/core'

import clsx from 'clsx'
import { SetStateAction, atom, useAtom, useAtomValue } from 'jotai'
import { noop } from 'lodash-es'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useLevels } from '../../../apis/level'
import { findLevelByStageName } from '../../../models/level'
import { sendMessage, useMessage } from '../../../utils/messenger'
import {
  CheckMapMessage,
  MAP_ORIGIN,
  MapReadyMessage,
  SetMapStateMessage,
  TileClickMessage,
  getMapUrl,
} from '../../editor/floatingMap/connection'
import { EditorAction, editorAtoms } from '../editor-state'
import { getInternalId } from '../reconciliation'

interface LevelMapProps {
  className?: string
}

type MapStatus = 'idle' | 'loading' | 'contentLoading' | 'ready' | 'error'

const stageNameAtom = atom((get) => get(editorAtoms.operationBase).stageName)
const activeActionAtomAtom = atom((get) => {
  const { activeActionId } = get(editorAtoms.ui)
  const actionAtoms = get(editorAtoms.actionAtoms)
  return (
    actionAtoms.find((atom) => getInternalId(get(atom)) === activeActionId) ||
    // return a placeholder atom that does nothing, because we always need an atom to be used on useAtom()
    atom<undefined, [SetStateAction<EditorAction>], void>(() => undefined, noop)
  )
})

export const LevelMap: FC<LevelMapProps> = memo(({ className }) => {
  const { data: levels } = useLevels()
  const stageName = useAtomValue(stageNameAtom)
  const activeActionAtom = useAtomValue(activeActionAtomAtom)
  const [activeAction, setActiveAction] = useAtom(activeActionAtom)
  const level = useMemo(
    () => (stageName ? findLevelByStageName(levels, stageName) : undefined),
    [stageName, levels],
  )
  const [mapStatus, setMapStatus] = useState<MapStatus>('idle')
  const [iframeWindow, setIframeWindow] = useState<Window | null>(null)

  useEffect(() => {
    setMapStatus((status) => {
      if (level) {
        return status === 'idle' || status === 'error' ? 'loading' : status
      }
      return 'idle'
    })
  }, [level])

  const activeLocation =
    activeAction && 'location' in activeAction
      ? activeAction.location
      : undefined

  // update or reset the active tiles when active action's location changes
  const setMapState = useCallback(() => {
    if (iframeWindow) {
      const activeTiles =
        activeLocation?.[0] !== undefined && activeLocation?.[1] !== undefined
          ? [{ x: activeLocation[0], y: activeLocation[1] }]
          : []
      sendMessage<SetMapStateMessage>(iframeWindow, MAP_ORIGIN, {
        type: 'setMapState',
        data: { activeTiles },
      })
    }
  }, [iframeWindow, activeLocation])

  // immediately sync remote state when local state has changed
  useEffect(setMapState, [setMapState])

  useMessage<TileClickMessage>(MAP_ORIGIN, 'tileClick', (e) => {
    const location = e.message.data.maaLocation
    setActiveAction((action) => action && { ...action, location })
  })

  useMessage<MapReadyMessage>(MAP_ORIGIN, 'mapReady', () => {
    setMapStatus('ready')

    // sync remote state when it is ready
    setMapState()
  })

  // check the connection when the component is re-mounted, useful during development
  useEffect(() => {
    if (iframeWindow) {
      sendMessage<CheckMapMessage>(iframeWindow, MAP_ORIGIN, {
        type: 'checkMap',
      })
    }
  }, [iframeWindow])

  return (
    <div className={clsx('relative flex-grow', className)}>
      {level && (
        <iframe
          title="Theresa Map"
          className="w-full h-full"
          src={getMapUrl(level)}
          onLoad={(e) => {
            setIframeWindow(e.currentTarget.contentWindow)
            setMapStatus('contentLoading')
          }}
        />
      )}
      {(mapStatus === 'idle' || mapStatus === 'loading') && (
        <NonIdealState
          className="absolute inset-0 bg-gray-900/50 [&_*]:!text-white"
          icon={
            mapStatus === 'loading' ? (
              <Spinner className="[&_.bp4-spinner-head]:stroke-current" />
            ) : (
              'area-of-interest'
            )
          }
          description={
            mapStatus === 'loading' ? '等待地图连接...' : '请选择关卡'
          }
        />
      )}
    </div>
  )
})
LevelMap.displayName = 'LevelMap'
