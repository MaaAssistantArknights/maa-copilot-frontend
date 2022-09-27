import ajvLocalizeZh from 'ajv-i18n/localize/zh'
import { UseFormSetError } from 'react-hook-form'
import { copilotSchemaValidator } from '../../models/copilot.schema.validator'
import type { CopilotDocV1 } from 'models/copilot.schema'

export function validateOperation(
  operation: CopilotDocV1.OperationSnakeCased,
  setError: UseFormSetError<CopilotDocV1.Operation>,
): boolean {
  const emptyGroup = operation.groups?.find(
    (group) => !group.opers || group.opers.length === 0,
  )

  if (emptyGroup) {
    setError('global' as any, {
      message: `干员组${emptyGroup.name}不能为空`,
    })
    return false
  }

  const jsonSchemaValidation = copilotSchemaValidator.validate(
    'copilot',
    operation,
  )
  console.log(
    'jsonSchemaValidationResult',
    jsonSchemaValidation,
    'errors',
    copilotSchemaValidator.errors,
  )

  if (!jsonSchemaValidation && copilotSchemaValidator.errors) {
    ajvLocalizeZh(copilotSchemaValidator.errors)
    setError('global' as any, {
      message: copilotSchemaValidator.errorsText(copilotSchemaValidator.errors),
    })
    return false
  }

  return true
}
