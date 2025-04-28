import { atom, useAtomValue } from 'jotai'
import { findLastIndex, isNumber, isString, get as lodashGet } from 'lodash-es'
import { useMemo } from 'react'

import { editorAtoms } from '../editor-state'
import { toMaaOperation } from '../reconciliation'
import { ZodIssue, getLabel, operationSchema } from './schema'

export type EntityIssue = ZodIssue & {
  fieldLabel?: string
}

export const editorGlobalErrorsAtom = atom<ZodIssue[]>([])
export const editorEntityErrorsAtom = atom<Record<string, EntityIssue[]>>({})
export const editorErrorsVisibleAtom = atom(false)
export const editorVisibleGlobalErrorsAtom = atom((get) =>
  get(editorErrorsVisibleAtom) ? get(editorGlobalErrorsAtom) : undefined,
)
export const editorVisibleEntityErrorsAtom = atom((get) =>
  get(editorErrorsVisibleAtom) ? get(editorEntityErrorsAtom) : undefined,
)

export function useEntityErrors(id: string): EntityIssue[] | undefined {
  return useAtomValue(
    useMemo(
      () => atom((get) => get(editorVisibleEntityErrorsAtom)?.[id]),
      [id],
    ),
  )
}

export const editorValidationAtom = atom(null, (get, set) => {
  const operation = get(editorAtoms.operation)
  const result = operationSchema.safeParse(toMaaOperation(operation))

  const globalIssues: ZodIssue[] = []
  const entityIssues: Record<string, EntityIssue[]> = {}

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const entityIndexIndex = findLastIndex(issue.path, isNumber)
      if (entityIndexIndex !== -1) {
        const entityPath = issue.path.slice(0, entityIndexIndex + 1)
        try {
          const entity = lodashGet(operation, entityPath)
          // TODO: do not hardcode "_id"
          if (entity && '_id' in entity && isString(entity._id)) {
            ;(entityIssues[entity._id] ||= []).push({
              ...issue,
              fieldLabel: getLabel(issue.path),
            })
            return
          }
        } catch {
          /* ignored */
        }
      }
      globalIssues.push(issue)
    })
  }

  set(editorEntityErrorsAtom, (prev) =>
    Object.keys(entityIssues).length === 0 && Object.keys(prev).length === 0
      ? prev
      : entityIssues,
  )
  set(editorGlobalErrorsAtom, (prev) =>
    prev.length === 0 && globalIssues.length === 0 ? prev : globalIssues,
  )

  return result
})
