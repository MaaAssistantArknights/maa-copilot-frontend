import { Suggest2, Suggest2Props } from '@blueprintjs/select'

import { useEffect, useMemo, useState } from 'react'
import { ControllerFieldState } from 'react-hook-form'

import { FieldResetButton } from './FieldResetButton'

interface SuggestProps<T> extends Suggest2Props<T> {
  debounce?: number // defaults to 100(ms), set to 0 to disable
  fieldState?: ControllerFieldState
  onReset?: () => void
}

export const Suggest = <T,>({
  debounce = 100,
  fieldState,
  onReset,

  items,
  itemListPredicate,
  inputProps,
  ...suggest2Props
}: SuggestProps<T>) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // the debounce fixes https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/72
  useEffect(() => {
    if (debounce) {
      const timer = setTimeout(() => setDebouncedQuery(query), debounce)
      return () => clearTimeout(timer)
    }
    setDebouncedQuery(query)
    return undefined
  }, [query, debounce])

  const filteredItems = useMemo(
    () => itemListPredicate?.(debouncedQuery, items) || items,
    [itemListPredicate, debouncedQuery, items],
  )

  useEffect(() => {
    if (!fieldState?.isTouched) {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [fieldState?.isTouched])

  return (
    <Suggest2<T>
      items={filteredItems}
      query={query}
      onQueryChange={setQuery}
      inputProps={{
        onKeyDown: (event) => {
          // prevent form submission
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        },
        rightElement: (
          <FieldResetButton
            disabled={!fieldState?.isDirty}
            onReset={() => {
              setQuery('')
              setDebouncedQuery('')
              onReset?.()
            }}
          />
        ),
        ...inputProps,
      }}
      popoverProps={{
        placement: 'bottom-start',
      }}
      {...suggest2Props}
    />
  )
}
