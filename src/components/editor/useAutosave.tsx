import {
  Alert,
  Button,
  ButtonProps,
  Callout,
  H4,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { first } from 'lodash-es'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { formatRelativeTime } from '../../utils/times'

export interface AutosaveOptions<T> {
  key: string
  interval: number
  limit: number
  shouldSave?: (value: T, archive: Archive<T>) => boolean
  onSave?: (value: T, archive: Archive<T>) => void
}

interface Record<T> {
  /** Value */
  v: T
  /** Time */
  t: number
}

type Archive<T> = Record<T>[]

export const isChangedSinceLastSave = (
  value: unknown,
  archive: Archive<unknown>,
) => JSON.stringify(value) !== JSON.stringify(first(archive)?.v)

export function useAutosave<T>(
  getValue: () => T,
  {
    key,
    interval,
    limit,
    shouldSave = isChangedSinceLastSave,
    onSave,
  }: AutosaveOptions<T>,
) {
  const [archive, setArchive] = useState<Archive<T>>(() => {
    const initialArchive = localStorage.getItem(key)

    if (initialArchive) {
      try {
        return JSON.parse(initialArchive)
      } catch (e) {
        console.warn(e)
      }
    }

    return []
  })

  const latestArchive = useRef(archive)
  latestArchive.current = archive

  const timer = useRef<ReturnType<typeof setInterval>>()

  const doSave = useCallback(
    (value: T = getValue()) => {
      if (!shouldSave(value, latestArchive.current)) {
        return
      }

      // perform a deep clone to prevent value's mutation (from outside) from affecting the archive
      value = JSON.parse(JSON.stringify(value))

      const record: Record<T> = {
        v: value,
        t: Date.now(),
      }
      const newArchive = [record, ...(latestArchive.current || [])].slice(
        0,
        limit,
      )

      while (newArchive.length > 0) {
        try {
          localStorage.setItem(key, JSON.stringify(newArchive))
          setArchive(newArchive)
          onSave?.(value, newArchive)
          break
        } catch (e) {
          // drop oldest record in case of capacity excess
          newArchive.pop()

          if (newArchive.length === 0) {
            console.warn('Failed to save：', e)
          }
        }
      }
    },
    [limit],
  )

  useEffect(() => {
    clearInterval(timer.current)
    timer.current = setInterval(doSave, interval)
    return () => clearInterval(timer.current)
  }, [interval, limit, doSave])

  // immediately save and reset the timer
  const save = (value?: T) => {
    doSave(value)
    clearInterval(timer.current)
    timer.current = setInterval(doSave, interval)
  }

  // trigger save on unmount and page unload
  useEffect(() => () => save(), [])
  window.addEventListener('beforeunload', () => save())

  return {
    archive,
    save,
  }
}

interface AutosaveSheetProps<T> extends ButtonProps {
  archive: Archive<T>
  options: AutosaveOptions<T>
  itemTitle: (record: Record<T>) => ReactNode
  onRestore: (value: T) => void
}

export const AutosaveSheet = <T,>({
  archive,
  itemTitle,
  options: { interval, limit },
  onRestore,
  ...buttonProps
}: AutosaveSheetProps<T>) => {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const restoringRecord = useRef<Record<T>>()

  const handleRestore = () => {
    if (restoringRecord.current) {
      onRestore(restoringRecord.current.v)
      restoringRecord.current = undefined
    }
    setRestoreDialogOpen(false)
  }

  return (
    <>
      <Popover2
        content={
          <>
            <Callout intent="primary">
              每隔 {~~(interval / 1000 / 60)}{' '}
              分钟自动保存编辑过的内容，记录上限为 {limit} 条
            </Callout>
            <Menu className="mt-2 p-0">
              {archive.map((record) => (
                <MenuItem
                  multiline
                  icon="time"
                  text={
                    <>
                      {itemTitle(record)}
                      <div className="text-xs opacity-75">
                        {formatRelativeTime(record.t)}
                      </div>
                    </>
                  }
                  key={record.t}
                  onClick={() => {
                    restoringRecord.current = record
                    setRestoreDialogOpen(true)
                  }}
                />
              ))}
            </Menu>
          </>
        }
      >
        <Button
          icon="history"
          text={
            archive.length
              ? `已自动保存：${formatRelativeTime(first(archive)?.t)}`
              : '未保存'
          }
          {...buttonProps}
        />
      </Popover2>

      <Alert
        isOpen={restoreDialogOpen}
        cancelButtonText="取消"
        confirmButtonText="确定"
        icon="rotate-document"
        intent="danger"
        canOutsideClickCancel
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={handleRestore}
      >
        <H4>恢复内容</H4>
        <p>当前的编辑内容将会被覆盖，确定要恢复内容吗？</p>
      </Alert>
    </>
  )
}
