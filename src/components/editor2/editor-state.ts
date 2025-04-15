import { PrimitiveAtom, atom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { DeepPartial } from 'react-hook-form'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { MinimumRequired } from '../../models/operation'

export interface EditorState {
  form: EditorFormValues
  visibility: 'public' | 'private'
}
export interface EditorFormValues extends DeepPartial<CopilotDocV1.Operation> {}

export const defaultFormValues: EditorFormValues = {
  minimumRequired: MinimumRequired.V4_0_0,
}
const defaultEditorState: EditorState = {
  form: defaultFormValues,
  visibility: 'public',
}

export const editorStateAtom = atom<StateHistory<EditorState>>({
  stack: [
    { state: defaultEditorState, action: 'INITIAL', actionDesc: '初始化' },
  ],
  index: 0,
  limit: 20,
})

interface HistoryRecord<T> {
  state: T
  action: string
  actionDesc: string
}

interface StateHistory<T> {
  stack: HistoryRecord<T>[]
  index: number
  limit: number
}

export function useAtomHistory<T>(atom: PrimitiveAtom<StateHistory<T>>) {
  const [history, setHistory] = useAtom(atom)
  const canUndo = history.index > 0
  const canRedo = history.index < history.stack.length - 1
  const undo = () => {
    setHistory((prev) => {
      if (prev.index <= 0) {
        return prev
      }
      return {
        ...prev,
        index: prev.index - 1,
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
    state: history.stack[history.index].state,
    history,
    canUndo,
    canRedo,
    undo,
    redo,
    update,
    checkpoint,
  }
}

function pushState<T>(
  { stack, index, limit }: StateHistory<T>,
  newState: HistoryRecord<T>,
) {
  const newStack = [...stack.slice(-limit, index), stack[index], newState]
  return {
    stack: newStack,
    index: newStack.length - 1,
    limit,
  }
}
