import {
  PrimitiveAtom,
  SetStateAction,
  atom,
  getDefaultStore,
  useAtom,
} from 'jotai'
import { atomFamily, atomWithStorage, splitAtom } from 'jotai/utils'
import { noop } from 'lodash-es'
import { useMemo } from 'react'
import { SetRequired, Simplify } from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { PartialDeep } from '../../utils/partial-deep'
import { createHistoryAtom, useHistoryEdit } from './history'
import {
  WithId,
  WithPartialCoordinates,
  toEditorOperation,
} from './reconciliation'
import { ZodIssue, operationLooseSchema } from './validation/schema'
import { EntityIssue } from './validation/validation'

export interface EditorState {
  operation: EditorOperation
  metadata: EditorMetadata
}

const defaultOperation = operationLooseSchema.parse({ version: 2 })

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
  WithId<SetRequired<PartialDeep<CopilotDocV1.Operator>, 'name'>>
>
export type EditorGroup = Simplify<
  WithId<
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
        WithId<{
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
  1 as unknown as PrimitiveAtom<EditorOperator[]>,
)
export type BaseEditorGroup = Simplify<
  Omit<EditorGroup, 'opers'> & {
    opersAtom: PrimitiveAtom<EditorOperator[]>
    operAtomsAtom: typeof __operAtomsAtom
  }
>

const baseAtom = atom<EditorOperationBase>({
  version: defaultOperation.version,
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
        (original) => original.id === group.id,
      )

      // 读取之前的 opersAtom 和 operAtomsAtom，如果没有就创建新的
      const opersAtom = originalBaseGroup?.opersAtom ?? atom(opers)
      set(opersAtom, opers)
      const operAtomsAtom =
        originalBaseGroup?.operAtomsAtom ?? splitAtom(opersAtom, getId)

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

interface EditorConfig {
  showLinkerButtons: boolean
  toggleSelectorPanel: boolean
  historyLimit: number
  showErrorsByDefault: boolean
}
const defaultConfig: EditorConfig = {
  showLinkerButtons: false,
  toggleSelectorPanel: true,
  historyLimit: 20,
  showErrorsByDefault: false,
}
const localConfigAtom = atomWithStorage<Partial<EditorConfig>>(
  'prts-editor-config',
  {},
  undefined,
  { getOnInit: true },
)
const initialConfig = {
  ...defaultConfig,
  ...getDefaultStore().get(localConfigAtom),
}
const configAtom = atom(
  (get) => ({
    ...defaultConfig,
    ...get(localConfigAtom),
  }),
  (get, set, update: SetStateAction<Partial<EditorConfig>>) => {
    if (typeof update === 'function') {
      update = update(get(configAtom))
    }
    set(localConfigAtom, (prev) => ({ ...prev, ...update }))

    if (update.showErrorsByDefault) {
      set(editorErrorsVisibleAtom, true)
    }
    if (update.historyLimit !== undefined) {
      set(historyAtom, (prev) => ({
        ...prev,
        limit: update.historyLimit!,
      }))
    }
  },
)

const editorGlobalErrorsAtom = atom<ZodIssue[]>([])
const editorEntityErrorsAtom = atom<Record<string, EntityIssue[]>>({})
const editorErrorsVisibleAtom = atom(initialConfig.showErrorsByDefault)
const editorVisibleGlobalErrorsAtom = atom((get) =>
  get(editorErrorsVisibleAtom) ? get(editorGlobalErrorsAtom) : undefined,
)
const editorVisibleEntityErrorsAtom = atom((get) =>
  get(editorErrorsVisibleAtom) ? get(editorEntityErrorsAtom) : undefined,
)

// this atom will cause some memory leak but generally not a big deal
const skillLevelOverridesAtom = atomFamily((id: string) =>
  atom<Record<number, number>>({}),
)

export const editorAtoms = {
  editor: editorAtom,
  operation: operationAtom,
  operationBase: baseAtom,
  metadata: metadataAtom,
  operators: operatorsAtom,
  operatorAtoms: splitAtom(operatorsAtom, getId),
  groups: groupsAtom,
  groupAtoms: splitAtom(groupsAtom, getId),
  baseGroups: baseGroupsAtom,
  baseGroupAtoms: splitAtom(baseGroupsAtom, getId),
  actions: actionsAtom,
  actionAtoms: splitAtom(actionsAtom, getId),

  // config
  config: configAtom,

  // UI
  activeGroupIdAtom: atom<string | undefined>(undefined),
  newlyAddedGroupIdAtom: atom<string | undefined>(undefined),
  activeActionIdAtom: atom<string | undefined>(undefined),
  sourceEditorIsOpen: atom(false),
  selectorPanelMode: atom<'operator' | 'map'>('operator'),
  // this atom will cause some memory leak as it does not clean up until the editor is reset,
  // but generally it's not a big deal
  skillLevelOverrides: skillLevelOverridesAtom,

  // validation
  globalErrors: editorGlobalErrorsAtom,
  entityErrors: editorEntityErrorsAtom,
  errorsVisible: editorErrorsVisibleAtom,
  visibleGlobalErrors: editorVisibleGlobalErrorsAtom,
  visibleEntityErrors: editorVisibleEntityErrorsAtom,

  reset: atom(
    null,
    (get, set, editorState: EditorState = defaultEditorState) => {
      set(editorAtom, editorState)
      set(editorGlobalErrorsAtom, [])
      set(editorEntityErrorsAtom, {})

      skillLevelOverridesAtom.setShouldRemove(() => true)
      skillLevelOverridesAtom.setShouldRemove(null)
      const setSkillLevel = (operator: EditorOperator) => {
        if (operator.skill && operator.requirements?.skillLevel) {
          set(skillLevelOverridesAtom(operator.id), {
            [operator.skill]: operator.requirements.skillLevel,
          })
        }
      }
      editorState.operation.opers.forEach(setSkillLevel)
      editorState.operation.groups.forEach((group) =>
        group.opers.forEach(setSkillLevel),
      )
    },
  ),
}

export const historyAtom = createHistoryAtom(
  editorAtom,
  initialConfig.historyLimit,
)

export function useEdit() {
  return useHistoryEdit(historyAtom)
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

function getId(entity: WithId) {
  return entity.id
}
