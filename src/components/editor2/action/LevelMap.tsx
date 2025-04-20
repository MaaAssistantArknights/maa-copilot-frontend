import { NonIdealState, Spinner } from '@blueprintjs/core'

import clsx from 'clsx'
import { atom, useAtomValue } from 'jotai'
import {
  FC,
  ReactEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useLevels } from '../../../apis/level'
import { findLevelByStageName } from '../../../models/level'
import { getMapUrl } from '../../editor/floatingMap/connection'
import { editorAtoms } from '../editor-state'

interface LevelMapProps {
  className?: string
}

type MapStatus = 'idle' | 'loading' | 'contentLoading' | 'ready' | 'error'

const stageNameAtom = atom((get) => get(editorAtoms.operationBase).stageName)

export const LevelMap: FC<LevelMapProps> = ({ className }) => {
  const { data: levels } = useLevels()
  const stageName = useAtomValue(stageNameAtom)
  const level = useMemo(
    () => (stageName ? findLevelByStageName(levels, stageName) : undefined),
    [stageName, levels],
  )
  const [mapStatus, setMapStatus] = useState<MapStatus>('idle')
  const iframeWindow = useRef<Window | null>(null)

  useEffect(() => {
    setMapStatus((status) => {
      if (level) {
        return status === 'idle' || status === 'error' ? 'loading' : status
      }
      return 'idle'
    })
  }, [level])

  const handleLoad: ReactEventHandler<HTMLIFrameElement> = (e) => {
    iframeWindow.current = e.currentTarget.contentWindow
    setMapStatus('contentLoading')
  }

  return (
    <div className={clsx('relative flex-grow', className)}>
      {level && (
        <iframe
          title="Theresa Map"
          className="w-full h-full"
          src={getMapUrl(level)}
          onLoad={handleLoad}
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
}
