import { useAtom as useAtomValue, useSetAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { memo, useEffect, useMemo } from 'react'

import { editorAtoms } from '../editor-state'
import { editorValidationAtom } from './validation'

export const Validator = memo(() => {
  const operation = useAtomValue(editorAtoms.operation)
  const validate = useSetAtom(editorValidationAtom)
  const debouncedValidate = useMemo(() => debounce(validate, 500), [validate])

  useEffect(() => {
    debouncedValidate()
  }, [operation, debouncedValidate])

  return null
})
Validator.displayName = 'Validator'
