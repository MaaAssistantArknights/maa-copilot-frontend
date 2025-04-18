import ajvLocalizeZh from 'ajv-i18n/localize/zh'
import i18next from 'i18next'
import {
  DeepPartial,
  ErrorOption,
  FieldPath,
  UseFormSetError,
} from 'react-hook-form'

import { CopilotDocV1 } from 'models/copilot.schema'

import { copilotSchemaValidator } from '../../models/copilot.schema.validator'
import {
  findActionType,
  validTypesFollowingBulletTime,
} from '../../models/types'

export function validateOperation(
  operation: DeepPartial<CopilotDocV1.OperationSnakeCased>,
  setError: UseFormSetError<CopilotDocV1.Operation>,
): boolean {
  const errors: Partial<
    Record<FieldPath<CopilotDocV1.Operation> | 'global', ErrorOption>
  > = {}
  const globalErrors: string[] = []
  const t = i18next.t

  const { actions, groups } = operation

  const emptyGroup = groups?.find((group) => (group?.opers?.length || 0) === 0)

  if (emptyGroup) {
    globalErrors.push(
      t('components.editor.validation.empty_group', { name: emptyGroup.name }),
    )
  }

  if (actions) {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]

      if (action?.type === CopilotDocV1.Type.BulletTime) {
        const nextType = actions[i + 1]?.type

        if (!nextType || !validTypesFollowingBulletTime.includes(nextType)) {
          globalErrors.push(
            t('components.editor.validation.bullet_time_error', {
              index: i + 1,
              actionType: findActionType(action.type).alternativeValue,
              validTypes: validTypesFollowingBulletTime
                .map((type) => findActionType(type).alternativeValue)
                .join(t('components.editor.validation.bullet_time_separator')),
            }),
          )
        }
      }
    }
  }

  // force details to exist to bypass ajv's required check - we can patch it later,
  // don't be so strict right now!
  operation = {
    ...operation,
    doc: {
      ...operation.doc,
      details: operation.doc?.details || 'dummy',
    },
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
    if (i18next.language === 'cn') {
      ajvLocalizeZh(copilotSchemaValidator.errors)
    }

    globalErrors.push(
      copilotSchemaValidator.errorsText(undefined, {
        separator: '\n',
      }),
    )
  }

  if (globalErrors.length > 0) {
    errors.global = { message: globalErrors.join('\n') }
  }

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(
      ([key, value]) => value && setError(key as any, value),
    )
    return false
  }

  return true
}
