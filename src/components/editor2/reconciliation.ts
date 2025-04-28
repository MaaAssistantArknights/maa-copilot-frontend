import camelcaseKeys from 'camelcase-keys'
import { defaults, uniqueId } from 'lodash-es'
import { CamelCasedPropertiesDeep, PartialDeep, SetRequired } from 'type-fest'

import { CopilotDocV1 } from '../../models/copilot.schema'
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

export type WithInternalId<T = {}> = T extends never
  ? never
  : T & { _id: string }

export function getInternalId(target: WithInternalId) {
  if (!target._id) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Missing internal ID')
    }
    target._id = uniqueId()
  }
  return target._id
}

export function createAction(
  initialValues: SetRequired<Partial<Omit<EditorAction, '_id'>>, 'type'>,
) {
  const action: EditorAction = defaults({}, initialValues, { _id: uniqueId() })
  if (action.type === CopilotDocV1.Type.SkillUsage) {
    action.skillUsage = CopilotDocV1.SkillUsageType.ReadyToUse
  }
  return action
}

export function createGroup(
  initialValues: Partial<Omit<EditorGroup, '_id' | 'opers'>> = {},
): EditorGroup {
  const group: EditorGroup = defaults({ name: '', opers: [] }, initialValues, {
    _id: uniqueId(),
  })
  return group
}

export function createOperator(
  initialValues: Omit<EditorOperator, '_id'>,
): EditorOperator {
  const operator: EditorOperator = defaults({ skill: 1 }, initialValues, {
    _id: uniqueId(),
  })
  return operator
}

export function toEditorOperation(
  source: CopilotOperationLoose,
): EditorOperation {
  const camelCased = camelcaseKeys(source, { deep: true })
  const operation = JSON.parse(JSON.stringify(camelCased))
  const converted = {
    ...operation,
    opers: operation.opers.map((operator) => ({
      ...operator,
      _id: uniqueId(),
    })),
    groups: operation.groups.map((group) => ({
      ...group,
      _id: uniqueId(),
      opers: group.opers.map((operator) => ({ ...operator, _id: uniqueId() })),
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
        _id: uniqueId(),
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
    opers: operation.opers.map(({ _id, ...operator }) => operator),
    groups: operation.groups.map(({ _id, opers, ...group }) => ({
      ...group,
      opers: opers.map(({ _id, ...operator }) => operator),
    })),
    actions: operation.actions.map((action, index, actions) => {
      type Action = PartialDeep<WithPartialCoordinates<CopilotDocV1.Action>>
      const {
        _id,
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
      '114514' as Exclude<
        keyof Action,
        // TODO: 兼容性处理，等到 _id 被去掉之后就可以去掉 Exclude _id 了
        '_id'
      > satisfies keyof typeof newAction

      return newAction
    }),
  }

  return snakeCaseKeysUnicode(converted, { deep: true })
}
