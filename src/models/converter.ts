import camelcaseKeys from 'camelcase-keys'
import { CopilotInfo } from 'maa-copilot-client'

import type { CopilotDocV1 } from 'models/copilot.schema'

export const INVALID_OPERATION_CONTENT: CopilotDocV1.Operation = Object.freeze({
  doc: {
    title: '无法解析作业内容',
  },
  minimumRequired: 'v4.0.0',
  actions: [],
  stageName: '',
})

export function toCopilotOperation(
  apiOperation: CopilotInfo,
): CopilotDocV1.Operation {
  try {
    const json = JSON.parse(apiOperation.content)
    return camelcaseKeys(json, { deep: true })
  } catch (e) {
    console.error('Failed to parse operation', apiOperation, e)
  }

  return INVALID_OPERATION_CONTENT
}
