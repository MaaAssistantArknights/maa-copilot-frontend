import { PrimitiveAtom, atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { PartialDeep, SetRequired, Simplify } from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { MinimumRequired } from '../../models/operation'
import { WithInternalId } from './reconciliation'

export interface EditorState {
  form: EditorFormValues
  visibility: 'public' | 'private'
}

export type EditorOperator = Simplify<
  WithInternalId<SetRequired<PartialDeep<CopilotDocV1.Operator>, 'name'>>
>
export type EditorGroup = Simplify<
  WithInternalId<
    PartialDeep<Omit<CopilotDocV1.Group, 'opers'>> & {
      name: string
      opers: EditorOperator[]
    }
  >
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

export interface EditorFormValues
  extends Omit<
    PartialDeep<CopilotDocV1.Operation>,
    'opers' | 'groups' | 'actions'
  > {
  opers: EditorOperator[]
  groups: EditorGroup[]
  actions: EditorAction[]
}

export const defaultFormValues: EditorFormValues = {
  minimumRequired: MinimumRequired.V4_0_0,
  opers: [],
  groups: [],
  actions: [],
}
const defaultEditorState: EditorState = {
  form: defaultFormValues,
  visibility: 'public',
}

export const editorStateHistoryAtom = atom<StateHistory<EditorState>>(
  createInitialEditorHistoryState(),
)
export const editorStateAtom = atom(
  (get) =>
    get(editorStateHistoryAtom).stack[get(editorStateHistoryAtom).index].state,
)

export function createInitialEditorHistoryState(
  initialState: EditorState = defaultEditorState,
) {
  const record = {
    state: initialState,
    action: 'INITIAL',
    actionDesc: '初始化',
  }
  return {
    stack: [record],
    index: 0,
    limit: 20,
    _current: record,
  }
}

export function useEditorHistory() {
  return useHistoryValue(editorStateHistoryAtom)
}

export function useEditorControls() {
  return useHistoryControls(editorStateHistoryAtom)
}

interface HistoryRecord<T> {
  state: T
  action: string
  actionDesc: string
}

interface StateHistory<T> {
  stack: HistoryRecord<T>[]
  index: number
  limit: number
  /** 主要是为了便于在 Redux Devtools 里查看 diff 用的，不要在代码里使用 */
  _current: HistoryRecord<T>
}

export function useHistoryValue<T>(atom: PrimitiveAtom<StateHistory<T>>) {
  const history = useAtomValue(atom)
  return {
    history,
    state: history.stack[history.index].state,
    canUndo: history.index > 0,
    canRedo: history.index < history.stack.length - 1,
  }
}

export function useHistoryControls<T>(atom: PrimitiveAtom<StateHistory<T>>) {
  const setHistory = useSetAtom(atom)
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
  const update = useCallback(
    (fn: (prevState: T) => T | undefined) => {
      setHistory((prev) => {
        let current = prev.stack[prev.index]
        const newState = fn(current.state)
        if (newState === undefined) {
          return prev
        }
        current = { ...current, state: newState }
        if (prev.index < prev.stack.length - 1) {
          return pushState(prev, current)
        }
        return {
          ...prev,
          stack: [...prev.stack.slice(0, prev.index), current],
          _current: current,
        }
      })
    },
    [setHistory],
  )
  const checkpoint = useCallback(
    (action: string, actionDesc: string, force: boolean) => {
      setHistory((prev) => {
        const current = prev.stack[prev.index]
        if (!force && current.action === action) {
          return prev
        }
        return pushState(prev, { ...current, action, actionDesc })
      })
    },
    [setHistory],
  )

  return {
    undo,
    redo,
    update,
    checkpoint,
  }
}

function pushState<T>(
  { stack, index, limit }: StateHistory<T>,
  newRecord: HistoryRecord<T>,
) {
  const newStack = [...stack.slice(-limit, index), stack[index], newRecord]
  return {
    stack: newStack,
    index: newStack.length - 1,
    limit,
    _current: newRecord,
  }
}
