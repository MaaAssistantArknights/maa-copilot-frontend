import { compact, uniqueId } from 'lodash-es'
import snakeCaseKeys from 'snakecase-keys'

import type { CopilotDocV1 } from 'models/copilot.schema'
import type { Level } from 'models/operation'
import { MinimumRequired } from 'models/operation'

/**
 * Creates an operation that can be used in editor. Used for importing.
 */
export function toEditableOperation(
  operation: CopilotDocV1.Operation,
): CopilotDocV1.Operation {
  operation = JSON.parse(JSON.stringify(operation))

  // generate IDs
  compact(
    [
      operation.actions,
      operation.opers,
      operation.groups,
      operation.groups?.map(({ opers }) => opers),
    ].flat(2),
  ).forEach((item) => {
    item._id = uniqueId()
  })

  return operation
}

/**
 * Creates an operation that satisfies the schema. Used for exporting.
 */
export function toQualifiedOperation(
  operation: CopilotDocV1.Operation,
  levels: Level[],
): CopilotDocV1.OperationSnakeCased {
  operation = JSON.parse(JSON.stringify(operation))

  operation.minimumRequired ||= MinimumRequired.V4_0_0

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

  // strip IDs
  compact(
    [
      operation.actions,
      operation.opers,
      operation.groups,
      operation.groups?.map(({ opers }) => opers),
    ].flat(2),
  ).forEach((item) => {
    delete item._id
  })

  // something's wrong with the typing
  return snakeCaseKeys(operation) as CopilotDocV1.OperationSnakeCased
}
