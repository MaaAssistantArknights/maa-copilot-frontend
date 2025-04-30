import camelcaseKeys from 'camelcase-keys'
import { CopilotInfo } from 'maa-copilot-client'

import type { CopilotDocV1 } from 'models/copilot.schema'

import i18n from '../i18n'

export const INVALID_OPERATION_CONTENT: CopilotDocV1.Operation = Object.freeze({
  doc: {
    title: i18n.t('models.converter.invalid_operation_content'),
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
    console.error(
      i18n.t('models.converter.failed_to_parse_operation'),
      apiOperation,
      e,
    )
  }

  return INVALID_OPERATION_CONTENT
}
