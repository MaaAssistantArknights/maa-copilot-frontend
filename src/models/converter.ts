import camelcaseKeys from 'camelcase-keys'
import { CopilotInfo } from 'maa-copilot-client'

import type { CopilotDocV1 } from 'models/copilot.schema'

import { i18n } from '../i18n/i18n'

export function toCopilotOperation(
  apiOperation: CopilotInfo,
): CopilotDocV1.Operation {
  try {
    const json = JSON.parse(apiOperation.content)
    return camelcaseKeys(json, { deep: true })
  } catch (e) {
    console.error('Failed to parse operation', apiOperation, e)
  }

  return {
    doc: {
      title: i18n.models.converter.invalid_operation_content,
    },
    minimumRequired: 'v4.0.0',
    actions: [],
    stageName: '',
  }
}
