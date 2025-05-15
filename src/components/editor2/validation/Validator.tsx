import { useAtom as useAtomValue, useSetAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { memo, useEffect, useMemo } from 'react'

import { translationsAtom } from '../../../i18n/i18n'
import { editorAtoms } from '../editor-state'
import { editorValidationAtom } from './validation'

export const Validator = memo(() => {
  const operation = useAtomValue(editorAtoms.operation)
  const translations = useAtomValue(translationsAtom)
  const validate = useSetAtom(editorValidationAtom)
  const debouncedValidate = useMemo(() => debounce(validate, 500), [validate])

  // re-validate when either operation or translations have changed
  useEffect(() => {
    debouncedValidate()
  }, [operation, translations, debouncedValidate])

  return null
})
Validator.displayName = 'Validator'
