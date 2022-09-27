import camelcaseKeys from 'camelcase-keys'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { Operation } from './operation'

export function toCopilotOperation(
  apiOperation: Operation,
): CopilotDocV1.Operation {
  const json = JSON.parse(apiOperation.content)
  const transformed = camelcaseKeys(json, { deep: true })
  return transformed as CopilotDocV1.Operation
}
