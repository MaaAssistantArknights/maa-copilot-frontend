import camelcaseKeys from 'camelcase-keys'
import { atom } from 'jotai'
import { defaults, uniqueId } from 'lodash-es'
import {
  CamelCasedPropertiesDeep,
  PartialDeep,
  SetOptional,
  SetRequired,
} from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { FavGroup, favGroupAtom } from '../../store/useFavGroups'
import { FavOperator, favOperatorAtom } from '../../store/useFavOperators'
import { snakeCaseKeysUnicode } from '../../utils/object'
import {
  EditorAction,
  EditorGroup,
  EditorOperation,
  EditorOperator,
} from './editor-state'
import { CopilotOperationLoose } from './validation/schema'

export type WithPartialCoordinates<T> = T extends {
  location?: [number, number]
}
  ? Omit<T, 'location'> & {
      location?: [number | undefined, number | undefined]
    }
  : T extends {
        distance?: [number, number]
      }
    ? Omit<T, 'distance'> & {
        distance?: [number | undefined, number | undefined]
      }
    : T

export type WithId<T = {}> = T extends never ? never : T & { id: string }

export function createAction(
  initialValues: SetRequired<Partial<Omit<EditorAction, 'id'>>, 'type'>,
) {
  const action: EditorAction = defaults({}, initialValues, { id: uniqueId() })
  if (action.type === CopilotDocV1.Type.SkillUsage) {
    action.skillUsage = CopilotDocV1.SkillUsageType.ReadyToUse
  }
  return action
}

export function createGroup(
  initialValues: Partial<Omit<EditorGroup, 'id' | 'opers'>> = {},
): EditorGroup {
  const group: EditorGroup = defaults({ name: '', opers: [] }, initialValues, {
    id: uniqueId(),
  })
  return group
}

export function createOperator(
  initialValues: Omit<EditorOperator, 'id'>,
): EditorOperator {
  const operator: EditorOperator = defaults({ skill: 1 }, initialValues, {
    id: uniqueId(),
  })
  return operator
}

const favOperatorCache = new WeakMap<FavOperator, WithId<FavOperator>>()
const favOperatorReverseCache = new WeakMap<
  WithId<FavOperator> | EditorOperator,
  FavOperator
>()
export const editorFavOperatorsAtom = atom(
  (get) =>
    get(favOperatorAtom).map((operator) => {
      const cached = favOperatorCache.get(operator)
      if (cached) {
        return cached
      }
      const newOperator = { ...operator, id: uniqueId() }
      favOperatorCache.set(operator, newOperator)
      favOperatorReverseCache.set(newOperator, operator)
      return newOperator
    }),
  (
    get,
    set,
    update:
      | (WithId<FavOperator> | EditorOperator)[]
      | ((
          prev: WithId<FavOperator>[],
        ) => (WithId<FavOperator> | EditorOperator)[]),
  ) => {
    if (typeof update === 'function') {
      update = update(get(editorFavOperatorsAtom))
    }
    const newOperators = update.map((operator) => {
      const cached = favOperatorReverseCache.get(operator)
      if (cached) {
        return cached
      }
      const { id, ...newOperator } = { ...operator, id: '' }
      favOperatorCache.set(newOperator, operator)
      favOperatorReverseCache.set(operator, newOperator)
      return newOperator
    })

    // 检查有没有多余的属性
    0 as unknown as FavOperator[] satisfies typeof newOperators
    set(favOperatorAtom, newOperators)
  },
)

const favGroupCache = new WeakMap<FavGroup, WithId<FavGroup>>()
const favGroupReverseCache = new WeakMap<
  WithId<FavGroup> | EditorGroup,
  FavGroup
>()
export const editorFavGroupsAtom = atom(
  (get) =>
    get(favGroupAtom).map((group) => {
      const cached = favGroupCache.get(group)
      if (cached) {
        return cached
      }
      const newGroup = { ...group, id: uniqueId() }
      favGroupCache.set(group, newGroup)
      favGroupReverseCache.set(newGroup, group)
      return newGroup
    }),
  (
    get,
    set,
    update:
      | (WithId<FavGroup> | EditorGroup)[]
      | ((prev: WithId<FavGroup>[]) => (WithId<FavGroup> | EditorGroup)[]),
  ) => {
    if (typeof update === 'function') {
      update = update(get(editorFavGroupsAtom))
    }
    const newGroups = update.map((group) => {
      const cached = favGroupReverseCache.get(group)
      if (cached) {
        return cached
      }
      const { id, ...newGroup } = {
        ...group,
        id: '',
        opers: group.opers?.map(
          (operator: CopilotDocV1.Operator | EditorOperator) => {
            const { id, ...newOperator } = {
              ...operator,
              id: '',
            }
            return newOperator
          },
        ),
      }
      favGroupCache.set(newGroup, group)
      favGroupReverseCache.set(group, newGroup)
      return newGroup
    })

    // 检查有没有多余的属性
    0 as unknown as FavGroup satisfies SetOptional<
      (typeof newGroups)[number],
      'opers'
    >
    set(favGroupAtom, newGroups)
  },
)

export function toEditorOperation(
  source: CopilotOperationLoose,
): EditorOperation {
  const camelCased = camelcaseKeys(source, { deep: true })
  const operation = JSON.parse(JSON.stringify(camelCased))
  const converted = {
    ...operation,
    opers: operation.opers.map((operator) => ({
      ...operator,
      id: uniqueId(),
    })),
    groups: operation.groups.map((group) => ({
      ...group,
      id: uniqueId(),
      opers: group.opers.map((operator) => ({ ...operator, id: uniqueId() })),
    })),
    actions: operation.actions.map((action, index) => {
      const {
        preDelay,
        postDelay,
        rearDelay,
        ...newAction
      }: EditorAction &
        CamelCasedPropertiesDeep<CopilotOperationLoose['actions'][number]> = {
        ...action,
        id: uniqueId(),
      }
      // intermediatePostDelay 等于当前动作的 preDelay
      if (preDelay !== undefined) {
        newAction.intermediatePostDelay = preDelay
      }
      if (index > 0 && action.type === 'SpeedUp') {
        // intermediatePreDelay 等于前一个动作的 postDelay
        const prevAction = operation.actions![index - 1]
        if (prevAction.rearDelay !== undefined) {
          newAction.intermediatePreDelay = prevAction.rearDelay
        }
        if (prevAction.postDelay !== undefined) {
          newAction.intermediatePreDelay = prevAction.postDelay
        }
      }
      return newAction satisfies EditorAction
    }),
  }

  return converted
}

/**
 * To MAA's standard format. No validation is performed so it's not guaranteed to be valid.
 */
export function toMaaOperation(
  operation: EditorOperation,
): CopilotOperationLoose {
  operation = JSON.parse(JSON.stringify(operation))
  const converted = {
    ...operation,
    opers: operation.opers.map(({ id, ...operator }) => operator),
    groups: operation.groups.map(({ id, opers, ...group }) => ({
      ...group,
      opers: opers.map(({ id, ...operator }) => operator),
    })),
    actions: operation.actions.map((action, index, actions) => {
      type Action = PartialDeep<WithPartialCoordinates<CopilotDocV1.Action>>
      const {
        _id,
        id,
        intermediatePreDelay,
        intermediatePostDelay,
        ...newAction
      }: EditorAction & Action = action
      // preDelay 等于当前动作的 intermediatePostDelay
      if (intermediatePostDelay !== undefined) {
        newAction.preDelay = intermediatePostDelay
      }
      if (index < actions.length - 1) {
        // postDelay 等于下一个动作的 intermediatePreDelay
        const nextAction = actions[index + 1]
        if (nextAction.intermediatePreDelay !== undefined) {
          newAction.postDelay = nextAction.intermediatePreDelay
        }
      }

      // 类型检查
      newAction satisfies Action
      // 检查多余的属性
      '114514' as keyof typeof newAction satisfies Exclude<
        keyof Action,
        // TODO: 兼容性处理，等到 _id 被去掉之后就可以去掉 Exclude _id 了
        '_id'
      >

      return newAction
    }),
  }

  // 如果没有版本号，则自动检测是否要设置一个
  if (converted.version === undefined) {
    if (
      converted.opers.some((operator) => operator.requirements) ||
      converted.groups.some((group) =>
        group.opers.some((operator) => operator.requirements),
      )
    ) {
      converted.version = 2
    }
  }

  return snakeCaseKeysUnicode(converted, { deep: true })
}
