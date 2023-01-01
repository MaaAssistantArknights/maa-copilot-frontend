import { NonIdealState } from '@blueprintjs/core'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Rnd, RndResizeCallback } from 'react-rnd'

import { sendMessage, useMessage } from '../../../utils/messenger'
import { useLazyStorage } from '../../../utils/useLazyStorage'
import { useFloatingMap } from './FloatingMapContext'
import {
  MAP_SITE,
  MapReadyMessage,
  SetMapStateMessage,
  getMapUrl,
} from './connection'

interface FloatingMapConfig {
  x: number
  y: number
  width: number
  height: number
}

const UID = 'floating-map'
const STORAGE_KEY = `copilot-${UID}`

export function FloatingMap() {
  const [config, setConfig] = useLazyStorage<FloatingMapConfig>(
    STORAGE_KEY,
    {
      x: 0,
      y: window.innerHeight - 300,
      width: 300 * (16 / 9),
      height: 300,
    },
    // merge two values in case the saved value is missing some properties
    (savedValue, defaultValue) => ({ ...defaultValue, ...savedValue }),
  )

  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const { levelId, activeTiles } = useFloatingMap()

  useEffect(() => {
    // when levelId changes, the iframe should reload
    setMapReady(false)
  }, [levelId])

  const setMapState = useCallback(() => {
    if (iframe?.contentWindow) {
      sendMessage<SetMapStateMessage>(iframe?.contentWindow, MAP_SITE, {
        type: 'setMapState',
        data: { activeTiles },
      })
    }
  }, [iframe, activeTiles])

  useEffect(setMapState, [setMapState])

  useMessage<MapReadyMessage>(MAP_SITE, 'mapReady', () => {
    setMapReady(true)

    // sync state when the map is ready
    setMapState()
  })

  // this function and the following resize/drag handlers are used to
  // disable pointer events on every iframe while resizing/dragging,
  // see: https://github.com/bokuweb/react-rnd/issues/609
  const toggleIframePointerEvents = useCallback((disable = false) => {
    Array.from(document.getElementsByTagName('iframe')).forEach((iframe) => {
      // eslint-disable-next-line no-param-reassign
      iframe.style.pointerEvents = disable ? 'none' : 'auto'
    })
  }, [])

  const onDragStartHandler = useCallback(() => {
    toggleIframePointerEvents(true)
  }, [toggleIframePointerEvents])

  const onDragStopHandler = useCallback(
    (e, { x, y }) => {
      toggleIframePointerEvents(false)
      setConfig((cfg) => ({ ...cfg, x, y }))
    },
    [toggleIframePointerEvents],
  )

  const onResizeStartHandler = useCallback(() => {
    toggleIframePointerEvents(true)
  }, [toggleIframePointerEvents])

  const onResizeStopHandler: RndResizeCallback = useCallback(
    (e, direction, ref, delta, pos) => {
      toggleIframePointerEvents(false)
      setConfig((cfg) => ({
        ...cfg,
        ...pos,
        width: parseFloat(ref.style.width),
        height: parseFloat(ref.style.height),
      }))
    },
    [toggleIframePointerEvents],
  )

  return createPortal(
    <div className="fixed z-50 inset-0 pointer-events-none">
      <Rnd
        className="!flex flex-col bg-black pointer-events-auto"
        dragHandleClassName="drag-handle"
        bounds="window"
        minWidth={150 * (16 / 9)}
        minHeight={150}
        lockAspectRatio={16 / 9}
        lockAspectRatioExtraHeight={16} // height of the drag handle
        default={config}
        onDragStart={onDragStartHandler}
        onDragStop={onDragStopHandler}
        onResizeStart={onResizeStartHandler}
        onResizeStop={onResizeStopHandler}
      >
        <div className="drag-handle h-[16px] cursor-move bg-gray-800" />
        {levelId ? (
          <>
            <iframe
              className="flex-grow"
              title={UID}
              src={getMapUrl(levelId)}
              ref={setIframe}
            />
            {mapReady || (
              <div className="absolute top-[16px] left-0 bg-black bg-opacity-50 text-white">
                等待地图连接……
              </div>
            )}
          </>
        ) : (
          <NonIdealState
            className="select-none"
            icon="area-of-interest"
            title="未选择关卡"
          />
        )}
      </Rnd>
    </div>,

    document.body,
  )
}
