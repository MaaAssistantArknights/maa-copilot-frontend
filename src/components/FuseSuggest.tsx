import { Suggest2, Suggest2Props } from '@blueprintjs/select'

import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
import { ControllerFieldState } from 'react-hook-form'

import { FieldResetButton } from './FieldResetButton'

interface FuseSuggestProps<T> extends Suggest2Props<T> {
  items: T[]
  fuse: Fuse.IFuseOptions<T>
  fieldState?: ControllerFieldState
  onReset?: () => void
}

export const FuseSuggest = <T,>({
  items,
  fuse: fuseOptions,
  fieldState,
  onReset,
  inputProps,
  ...suggest2Props
}: FuseSuggestProps<T>) => {
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        threshold: 0.3,
        ...fuseOptions,
      }),
    [items],
  )

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // the debounce fixes https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/72
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 100)
    return () => clearTimeout(timer)
  }, [query])

  const filteredItems = useMemo(() => {
    return debouncedQuery
      ? fuse.search(debouncedQuery).map((el) => el.item)
      : items
  }, [fuse, items, debouncedQuery])

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
