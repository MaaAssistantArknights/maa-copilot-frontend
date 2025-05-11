import {
  Getter,
  PrimitiveAtom,
  Setter,
  atom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { SetStateAction, useCallback } from 'react'

export interface Checkpoint {
  action: string
  desc: string
  squash: boolean
}

interface HistoryRecord<T> extends Checkpoint {
  state: T
  time: number
}

interface InternalHistoryTracker<T extends {}> {
  stack: HistoryRecord<T | null>[]
  index: number
  limit: number
}

interface HistoryTracker<T extends {}> {
  stack: HistoryRecord<T>[]
  index: number
  limit: number
  /** 主要是为了便于在 Redux Devtools 里查看 diff 用的，不要在代码里使用 */
  _current?: HistoryRecord<T>
}

function createInitialEditorHistoryState<T extends {}>(
  limit: number,
): InternalHistoryTracker<T> {
  const record = {
    state: null,
    action: 'init',
    desc: '初始化（锁定）',
    squash: false,
    time: Date.now(),
  }
  return {
    stack: [record],
    index: 0,
    limit,
  }
}

export function createHistoryAtom<T extends {}>(
  stateAtom: PrimitiveAtom<T>,
  limit: number,
) {
  const historyTrackerAtom = atom(createInitialEditorHistoryState<T>(limit))

  const fromInternal = <T extends {}>(
    tracker: InternalHistoryTracker<T>,
    currentState: T,
  ) => {
    let current = tracker.stack[tracker.index]
    if (current.state !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'historyAtom: state of the "current" record is not null',
          current,
        )
      }
    }
    current = { ...current, state: currentState }
    return {
      ...tracker,
      stack: tracker.stack.map((record, i) =>
        i === tracker.index ? current : record,
      ) as HistoryRecord<T>[],
      _current: current as HistoryRecord<T>,
    } satisfies HistoryTracker<T>
  }

  const toInternal = <T extends {}>(
    tracker: HistoryTracker<T>,
  ): InternalHistoryTracker<T> => {
    return {
      ...tracker,
      stack: tracker.stack.map((record, i) => ({
        ...record,
        state: i === tracker.index ? null : record.state,
      })),
    }
  }

  return atom(
    (get) => fromInternal(get(historyTrackerAtom), get(stateAtom)),
    (get, set, update: SetStateAction<HistoryTracker<T>>) => {
      const { _current, ...tracker } = fromInternal(
        get(historyTrackerAtom),
        get(stateAtom),
      )
      if (typeof update === 'function') {
        update = update(tracker)
      }
      const current = update.stack[update.index]
      set(stateAtom, current.state)
      set(historyTrackerAtom, toInternal(update))
    },
  )
}

export function useHistoryValue<T extends {}>(
  atom: PrimitiveAtom<HistoryTracker<T>>,
) {
  const history = useAtomValue(atom)
  return {
    history,
    state: history.stack[history.index].state,
    canUndo: history.index > 0,
    canRedo: history.index < history.stack.length - 1,
  }
}

const skipCheckpoint: Checkpoint = {
  action: '',
  desc: '',
  squash: false,
}

export function useHistoryControls<T extends {}>(
  historyAtom: PrimitiveAtom<HistoryTracker<T>>,
) {
  const setHistory = useSetAtom(historyAtom)
  const undo = () => {
    setHistory((prev) => {
      if (prev.index <= 0) {
        return prev
      }
      return { ...prev, index: prev.index - 1 }
    })
  }
  const redo = () => {
    setHistory((prev) => {
      if (prev.index >= prev.stack.length - 1) {
        return prev
      }
      return { ...prev, index: prev.index + 1 }
    })
  }
  const checkout = (index: number) => {
    setHistory((prev) => {
      if (index < 0 || index >= prev.stack.length) {
        return prev
      }
      return { ...prev, index }
    })
  }

  return {
    undo,
    redo,
    checkout,
  }
}

type HistoryEditFn = ((
  get: Getter,
  set: Setter,
  skip: Checkpoint,
) => Checkpoint) & {}

export function useHistoryEdit<T extends {}>(
  historyAtom: PrimitiveAtom<HistoryTracker<T>>,
) {
  return useAtomCallback(
    useCallback(
      (get, set, editFn: HistoryEditFn) => {
        const snapshot = get(historyAtom)
        const checkpoint = editFn(get, set, skipCheckpoint)
        const history = get(historyAtom)
        if (checkpoint === skipCheckpoint && history === snapshot) {
          return
        }
        const current = history.stack[history.index]
        if (checkpoint.squash && current.action === checkpoint.action) {
          return
        }
        const snapshottedCurrent = snapshot.stack[snapshot.index]
        if (JSON.stringify(current) === JSON.stringify(snapshottedCurrent)) {
          return
        }
        const newRecord = {
          ...current,
          ...checkpoint,
          time: Date.now(),
        }
        const newStack = [
          ...history.stack.slice(-(history.limit - 2), history.index),
          snapshottedCurrent,
          newRecord,
        ]
        // 永远保留第一条记录
        if (history.index >= history.limit - 2) {
          newStack.unshift(snapshot.stack[0])
        }
        set(historyAtom, {
          ...history,
          stack: newStack,
          index: newStack.length - 1,
        })
      },
      [historyAtom],
    ),
  )
}
