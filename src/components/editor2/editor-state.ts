import { PrimitiveAtom, SetStateAction, atom, useAtom } from 'jotai'
import { splitAtom } from 'jotai/utils'
import { noop } from 'lodash-es'
import { useMemo } from 'react'
import { SetRequired, Simplify } from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { PartialDeep } from '../../utils/partial-deep'
import {
  createHistoryAtom,
  useHistoryControls,
  useHistoryValue,
} from './history'
import {
  WithInternalId,
  WithPartialCoordinates,
  getInternalId,
  toEditorOperation,
} from './reconciliation'
import { operationLooseSchema } from './validation/schema'

export interface EditorState {
  operation: EditorOperation
  metadata: EditorMetadata
}

const defaultOperation = operationLooseSchema.parse({})

export const defaultEditorState: EditorState = {
  operation: toEditorOperation(defaultOperation),
  metadata: {
    visibility: 'public',
  },
}

interface EditorMetadata {
  visibility: 'public' | 'private'
}

type EditorOperationBase = Simplify<
  Omit<
    PartialDeep<CopilotDocV1.Operation>,
    'doc' | 'opers' | 'groups' | 'actions'
  > & {
    minimumRequired: string
    doc: PartialDeep<CopilotDocV1.Doc>
  }
>

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
      WithPartialCoordinates<
        Omit<
          SetRequired<PartialDeep<T>, 'type'>,
          'preDelay' | 'postDelay' | 'rearDelay'
        >
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

// splitAtom() 有重载，无法用正常方法来构造类型
const __operAtomsAtom = (noop as typeof splitAtom)(
  {} as PrimitiveAtom<EditorOperator[]>,
  getInternalId,
)
export type BaseEditorGroup = Simplify<
  Omit<EditorGroup, 'opers'> & {
    opersAtom: PrimitiveAtom<EditorOperator[]>
    operAtomsAtom: typeof __operAtomsAtom
  }
>

const baseAtom = atom<EditorOperationBase>({
  minimumRequired: defaultOperation.minimum_required,
  doc: defaultOperation.doc,
})
const operatorsAtom = atom<EditorOperator[]>([])
const baseGroupsAtom = atom<BaseEditorGroup[]>([])
const groupCache = new WeakMap<
  BaseEditorGroup,
  [EditorGroup, EditorOperator[]]
>()
const groupsAtom: PrimitiveAtom<EditorGroup[]> = atom(
  (get) =>
    get(baseGroupsAtom).map((baseGroup) => {
      const opers = get(baseGroup.opersAtom)
      const cached = groupCache.get(baseGroup)
      if (cached?.[1] === opers) {
        // base 和 opers 都没有变化，返回缓存的值，避免 rerender
        return cached[0]
      }
      const { opersAtom, operAtomsAtom, ...newGroup } = { ...baseGroup, opers }
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
      const { opers, ...rest } = group
      const originalBaseGroup = originalBaseGroups.find(
        (original) => getInternalId(original) === getInternalId(group),
      )

      // 读取之前的 opersAtom 和 operAtomsAtom，如果没有就创建新的
      const opersAtom = originalBaseGroup?.opersAtom ?? atom(opers)
      set(opersAtom, opers)
      const operAtomsAtom =
        originalBaseGroup?.operAtomsAtom ?? splitAtom(opersAtom, getInternalId)

      return {
        ...rest,
        opersAtom,
        operAtomsAtom,
      }
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
const metadataAtom = atom<EditorMetadata>({ visibility: 'public' })
const editorAtom = atom(
  (get): EditorState => ({
    operation: get(operationAtom),
    metadata: get(metadataAtom),
  }),
  (get, set, update: SetStateAction<EditorState>) => {
    if (typeof update === 'function') {
      update = update(get(editorAtom))
    }
    set(operationAtom, update.operation)
    set(metadataAtom, update.metadata)
  },
)

export const editorAtoms = {
  editor: editorAtom,
  operation: operationAtom,
  operationBase: baseAtom,
  metadata: metadataAtom,
  operators: operatorsAtom,
  operatorAtoms: splitAtom(operatorsAtom, getInternalId),
  groups: groupsAtom,
  groupAtoms: splitAtom(groupsAtom, getInternalId),
  baseGroups: baseGroupsAtom,
  baseGroupAtoms: splitAtom(baseGroupsAtom, getInternalId),
  actions: actionsAtom,
  actionAtoms: splitAtom(actionsAtom, getInternalId),

  // UI state
  activeGroupIdAtom: atom<string | undefined>(undefined),
  newlyAddedGroupIdAtom: atom<string | undefined>(undefined),
  activeActionIdAtom: atom<string | undefined>(undefined),
  sourceEditorIsOpen: atom(false),
}

export const historyAtom = createHistoryAtom(editorAtom)

export function useEditorHistory() {
  return useHistoryValue(historyAtom)
}

export function useEditorControls() {
  return useHistoryControls(historyAtom)
}

export function useActiveState(
  targetAtom: PrimitiveAtom<string | undefined>,
  id: string,
) {
  return useAtom(
    useMemo(() => {
      return atom(
        (get) => get(targetAtom) === id,
        (get, set, value: boolean) => set(targetAtom, value ? id : undefined),
      )
    }, [id, targetAtom]),
  )
}

export function traverseOperators<T>(
  { opers, groups }: { opers: EditorOperator[]; groups: EditorGroup[] },
  fn: (oper: EditorOperator) => T,
): NonNullable<T> | undefined {
  for (const oper of opers) {
    const result = fn(oper)
    if (result) return result
  }
  for (const group of groups) {
    for (const oper of group.opers) {
      const result = fn(oper)
      if (result) return result
    }
  }
  return undefined
}
