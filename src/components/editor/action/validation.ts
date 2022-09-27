import { UseFormSetError } from 'react-hook-form'

import type { CopilotDocV1 } from 'models/copilot.schema'

export function validateAction(
  action: CopilotDocV1.Action,
  setError: UseFormSetError<CopilotDocV1.Action>,
) {
  if (action.type === 'Skill' || action.type === 'Retreat') {
    if (!action.name && !action.location) {
      const error = {
        type: 'required',
        message: '类型为技能或撤退时，必须填写名称或位置其中一个',
      }
      setError('name', error)
      setError('location', error)
      return false
    }
  }

  return true
}
