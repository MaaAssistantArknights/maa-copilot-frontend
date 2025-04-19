import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { CopilotDocV1 } from 'models/copilot.schema'

export function createValidateAction(
  t: ReturnType<typeof useTranslation>['t'],
) {
  return function validateAction(
    action: CopilotDocV1.Action,
    setError: UseFormSetError<CopilotDocV1.Action>,
  ) {
    if (
      action.type === 'Skill' ||
      action.type === 'Retreat' ||
      action.type === 'BulletTime'
    ) {
      if (!action.name && !action.location) {
        const error = {
          type: 'required',
          message: t(
            'components.editor.action.validation.name_or_location_required',
          ),
        }
        setError('name', error)
        setError('location', error)
        return false
      }
    }

    return true
  }
}

export function validateAction(
  action: CopilotDocV1.Action,
  setError: UseFormSetError<CopilotDocV1.Action>,
) {
  if (
    action.type === 'Skill' ||
    action.type === 'Retreat' ||
    action.type === 'BulletTime'
  ) {
    if (!action.name && !action.location) {
      const error = {
        type: 'required',
        message:
          'When type is Skill, Retreat, or BulletTime, you must provide either a name or location',
      }
      setError('name', error)
      setError('location', error)
      return false
    }
  }

  return true
}
