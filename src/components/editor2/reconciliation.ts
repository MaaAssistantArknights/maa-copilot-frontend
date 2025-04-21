import { uniqueId } from 'lodash-es'

import { CopilotDocV1 } from '../../models/copilot.schema'
import {
  EditorAction,
  EditorGroup,
  EditorOperation,
  EditorOperator,
} from './editor-state'

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

export function createAction(type: CopilotDocV1.Type) {
  const action: EditorAction = {
    _id: uniqueId(),
    type,
  }
  if (action.type === CopilotDocV1.Type.SkillUsage) {
    action.skillUsage = CopilotDocV1.SkillUsageType.ReadyToUse
  }
  return action
}

export function createGroup(
  initialValues: Partial<Omit<EditorGroup, '_id' | 'opers'>> = {},
): EditorGroup {
  const group: EditorGroup = {
    _id: uniqueId(),
    name: initialValues.name || '',
    opers: [],
  }
  return group
}

export function createOperator(
  initialValues: Omit<EditorOperator, '_id'>,
): EditorOperator {
  const operator: EditorOperator = {
    _id: uniqueId(),
    name: initialValues.name,
  }
  return operator
}

export function toEditorOperation(
  operation: CopilotDocV1.Operation,
): EditorOperation {
  const values = {
    ...operation,
    opers:
      operation.opers?.map((operator) => ({ ...operator, _id: uniqueId() })) ||
      [],
    groups:
      operation.groups?.map((group) => ({
        ...group,
        _id: uniqueId(),
        opers:
          group.opers?.map((operator) => ({ ...operator, _id: uniqueId() })) ||
          [],
      })) || [],
    actions:
      operation.actions?.map((action, index) => {
        const {
          preDelay,
          postDelay,
          rearDelay,
          ...newAction
        }: EditorAction & CopilotDocV1.Action = {
          ...action,
          _id: uniqueId(),
        }
        // intermediatePostDelay 等于当前动作的 preDelay
        if (preDelay !== undefined) {
          newAction.intermediatePostDelay = preDelay
        }
        if (index > 0) {
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
      }) || [],
  }

  return values
}
