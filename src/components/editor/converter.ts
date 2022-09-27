import { FieldArrayWithId } from 'react-hook-form'
import snakeCaseKeys from 'snakecase-keys'

import type { CopilotDocV1 } from 'models/copilot.schema'
import type { Level } from 'models/operation'

import { WithTempId } from '../../types'

export function convertOperation(
  operation: CopilotDocV1.Operation,
  levels: Level[],
): CopilotDocV1.OperationSnakeCased {
  operation = JSON.parse(JSON.stringify(operation))

  operation.doc ||= {}

  if (!operation.doc.title) {
    const level = levels.find(({ levelId }) => levelId === operation.stageName)

    if (!level) {
      throw new Error('无效的关卡')
    }

    operation.doc.title = [level.catTwo, level.catThree, level.name]
      .filter(Boolean)
      .join(' - ')
  }

  operation.doc.details ||= operation.doc.title

  if (operation.opers) {
    operation.opers = sanitizePerformer(operation.opers)
  }

  if (operation.groups) {
    operation.groups = sanitizePerformer(operation.groups)
  }

  // something's wrong with the typing
  return snakeCaseKeys(operation) as CopilotDocV1.OperationSnakeCased
}

function sanitizePerformer<
  T extends CopilotDocV1.Group | CopilotDocV1.Operator,
>(performers: T[]) {
  return (performers as (FieldArrayWithId & WithTempId<T>)[]).map(
    ({ id, _id, ...performer }) => {
      const opers = (performer as CopilotDocV1.Group).opers

      if (opers) {
        return {
          ...performer,
          opers: sanitizePerformer(opers),
        }
      }

      return performer
    },
  )
}
