import { FieldArrayWithId } from 'react-hook-form'
import { WithTempId } from '../../types'

export function sanitizeOperation(
  operation: CopilotDocV1.Operation,
): CopilotDocV1.Operation {
  const { opers, groups } = operation

  return {
    ...operation,
    opers: opers && sanitizePerformer(opers),
    groups: groups && sanitizePerformer(groups),
  }
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
