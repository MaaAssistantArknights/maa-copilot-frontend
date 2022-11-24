import { isEqualWith } from 'lodash-es'
import { UseFormReturn, get, useFormContext } from 'react-hook-form'

import { CopilotDocV1 } from '../../../models/copilot.schema'

/**
 * Deep-compare two objects without comparing `id` fields in themselves and their descendants.
 * This is useful for comparing objects returned by `useFieldArray`, where the `id` field is
 * re-generated after each update.
 */
export function isFormValuesDirty<T>(a: T, b: T): boolean {
  a = JSON.parse(JSON.stringify(a))
  b = JSON.parse(JSON.stringify(b))
  return isEqualWith(a, b, (_va, _vb, key) => {
    if (key === 'id') return true
    return undefined
  })
}

export const useEditorForm =
  useFormContext as () => UseFormReturn<CopilotDocV1.Operation>

export function getFirstError(errors: any, name: string): string | undefined {
  const errorAtPath = get(errors, name)

  if (typeof errorAtPath === 'object') {
    return Object.values(errorAtPath as Record<string, any>).find(
      (obj: any) => 'message' in obj,
    )?.message
  }

  return undefined
}
