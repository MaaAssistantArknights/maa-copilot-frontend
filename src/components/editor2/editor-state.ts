import {
  PrimitiveAtom,
  SetStateAction,
  atom,
  useAtomValue,
  useSetAtom,
} from 'jotai'
import { atomFamily, splitAtom, useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { PartialDeep, SetRequired, Simplify } from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { WithInternalId, getInternalId } from './reconciliation'

export interface EditorState {
  operation: EditorOperation
  metadata: EditorMetadata
}

interface EditorMetadata {
  visibility: 'public' | 'private'
}

type EditorOperationBase = Simplify<
  Omit<
    PartialDeep<CopilotDocV1.Operation>,
    'doc' | 'opers' | 'groups' | 'actions'
  > & {
    doc: PartialDeep<CopilotDocV1.Doc>
  }
>

export type EditorOperator = Simplify<
  WithInternalId<SetRequired<PartialDeep<CopilotDocV1.Operator>, 'name'>>
>
export type BaseEditorGroup = Simplify<
  WithInternalId<
    PartialDeep<Omit<CopilotDocV1.Group, 'opers'>> & {
      name: string
    }
  >
>
export type EditorGroup = Simplify<
  BaseEditorGroup & {
    opers: EditorOperator[]
  }
>
export type EditorAction = GenerateEditorAction<CopilotDocV1.Action>
type GenerateEditorAction<T extends CopilotDocV1.Action> = T extends never
  ? never
  : Simplify<
      Omit<
        SetRequired<PartialDeep<T, { recurseIntoArrays: true }>, 'type'>,
        'preDelay' | 'postDelay' | 'rearDelay'
      > &
        WithInternalId<{
          intermediatePreDelay?: number
          intermediatePostDelay?: number
        }>
    >

export interface EditorOperation extends EditorOperationBase {
  opers: EditorOperator[]
  groups: EditorGroup[]
  actions: EditorAction[]
}

const baseAtom = atom<EditorOperationBase>({ doc: {} })
const operatorsAtom = atom<EditorOperator[]>([])
const baseGroupsAtom = atom<BaseEditorGroup[]>([])
const groupOperatorsAtom = atomFamily((groupId: string) =>
  atom<EditorOperator[]>([]),
)
const groupCache = new WeakMap<
  BaseEditorGroup,
  [EditorGroup, EditorOperator[]]
>()
const groupsAtom: PrimitiveAtom<EditorGroup[]> = atom(
  (get) =>
    get(baseGroupsAtom).map((baseGroup) => {
      const opers = get(groupOperatorsAtom(getInternalId(baseGroup)))
      const cached = groupCache.get(baseGroup)
      if (cached?.[1] === opers) {
        // base 和 opers 都没有变化，返回缓存的值，避免 rerender
        return cached[0]
      }
      const newGroup = { ...baseGroup, opers }
      groupCache.set(baseGroup, [newGroup, opers])
      return newGroup
    }),
  (get, set, update) => {
    const originalGroups = get(groupsAtom)
    const originalBaseGroups = get(baseGroupsAtom)
    if (typeof update === 'function') {
      update = update(originalGroups)
    }
    const baseGroups = update.map((group, index) => {
      // 无变化，保留原来的值
      if (group === originalGroups[index]) {
        return originalBaseGroups[index]
      }
      set(groupOperatorsAtom(getInternalId(group)), group.opers)
      const { opers, ...baseGroup } = group
      return baseGroup
    })
    set(baseGroupsAtom, baseGroups)
  },
)
const actionsAtom = atom<EditorAction[]>([])
const operationAtom = atom(
  (get): EditorOperation => ({
    ...get(baseAtom),
    opers: get(operatorsAtom),
    groups: get(groupsAtom),
    actions: get(actionsAtom),
  }),
  (get, set, update: SetStateAction<EditorOperation>) => {
    if (typeof update === 'function') {
      update = update(get(operationAtom))
    }
    const { opers, groups, actions, ...base } = update
    set(baseAtom, base)
    set(operatorsAtom, opers)
    set(groupsAtom, groups)
    set(actionsAtom, actions)
  },
)
const metadataAtom = atom<EditorMetadata>({
  visibility: 'public',
})

export const historyAtom = (() => {
  const historyTrackerAtom = atom(createInitialEditorHistoryState())

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
    (get) => {
      return fromInternal(get(historyTrackerAtom), {
        operation: get(operationAtom),
        metadata: get(metadataAtom),
      })
    },
    (get, set, update: SetStateAction<HistoryTracker<EditorState>>) => {
      const { _current, ...tracker } = fromInternal(get(historyTrackerAtom), {
        operation: get(operationAtom),
        metadata: get(metadataAtom),
      })
      if (typeof update === 'function') {
        update = update(tracker)
      }
      const current = update.stack[update.index]
      set(operationAtom, current.state.operation)
      set(metadataAtom, current.state.metadata)
      set(historyTrackerAtom, toInternal(update))
    },
  )
})()

interface EditorUIState {
  activeGroupId?: string
  newlyAddedGroupId?: string
  activeActionId?: string
}
const uiAtom = atom<EditorUIState>({})

export const editorAtoms = {
  operation: operationAtom,
  operationBase: baseAtom,
  metadata: metadataAtom,
  operators: operatorsAtom,
  operatorAtoms: splitAtom(operatorsAtom, getInternalId),
  groups: groupsAtom,
  baseGroupAtoms: splitAtom(baseGroupsAtom, getInternalId),
  groupAtoms: splitAtom(groupsAtom, getInternalId),
  groupOperators: groupOperatorsAtom,
  groupOperatorAtoms: atomFamily((groupId: string) =>
    splitAtom(groupOperatorsAtom(groupId), getInternalId),
  ),
  actions: actionsAtom,
  actionAtoms: splitAtom(actionsAtom, getInternalId),
  ui: uiAtom,
}

export function createInitialEditorHistoryState(): InternalHistoryTracker<EditorState> {
  const record = {
    state: null,
    action: '',
    desc: '',
    squash: false,
  }
  return {
    stack: [record],
    index: 0,
    limit: 20,
  }
}

export function useEditorHistory() {
  return useHistoryValue(historyAtom)
}

export function useEditorControls() {
  return useHistoryControls(historyAtom)
}

export interface Checkpoint {
  action: string
  desc: string
  squash: boolean
}

interface HistoryRecord<T> extends Checkpoint {
  state: T
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
      return {
        ...prev,
        index: prev.index - 1,
        _current: prev.stack[prev.index - 1],
      }
    })
  }
  const redo = () => {
    setHistory((prev) => {
      if (prev.index >= prev.stack.length - 1) {
        return prev
      }
      return {
        ...prev,
        index: prev.index + 1,
        _current: prev.stack[prev.index + 1],
      }
    })
  }
  const withCheckpoint = useAtomCallback(
    useCallback(
      (get, set, fn: (skip: Checkpoint) => Checkpoint) => {
        const snapshot = get(historyAtom)
        const checkpoint = fn(skipCheckpoint)
        const history = get(historyAtom)
        if (checkpoint === skipCheckpoint || history === snapshot) {
          return
        }
        const current = history.stack[history.index]
        if (checkpoint.squash && current.action === checkpoint.action) {
          return
        }
        const snapshottedCurrent = snapshot.stack[snapshot.index]
        const newRecord = { ...current, ...checkpoint }
        const newStack = [
          ...history.stack.slice(-history.limit, history.index),
          snapshottedCurrent,
          newRecord,
        ]
        set(historyAtom, {
          ...history,
          stack: newStack,
          index: newStack.length - 1,
        })
      },
      [historyAtom],
    ),
  )

  return {
    undo,
    redo,
    withCheckpoint,
  }
}
