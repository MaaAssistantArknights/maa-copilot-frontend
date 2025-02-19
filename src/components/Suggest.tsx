import { Suggest2, Suggest2Props } from '@blueprintjs/select'

import { noop } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ControllerFieldState } from 'react-hook-form'

import { FieldResetButton } from './FieldResetButton'

interface SuggestProps<T> extends Suggest2Props<T> {
  debounce?: number // defaults to 100(ms), set to 0 to disable
  updateQueryOnSelect?: boolean
  fieldState?: ControllerFieldState
  onReset?: () => void
}

export const Suggest = <T,>({
  debounce = 100,
  updateQueryOnSelect,
  fieldState,
  onReset,

  items,
  itemListPredicate,
  selectedItem,
  inputValueRenderer,
  inputProps,
  ...suggest2Props
}: SuggestProps<T>) => {
  // 禁用掉 focus 自动选中输入框文字的功能
  // https://github.com/palantir/blueprint/blob/b41f668461e63e2c20caf54a3248181fe01161c4/packages/select/src/components/suggest/suggest2.tsx#L229
  const ref = useRef<Suggest2<T>>(null)
  if (ref.current && ref.current['selectText'] !== noop) {
    ref.current['selectText'] = noop
  }

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

  useEffect(() => {
    if (updateQueryOnSelect && selectedItem) {
      setQuery(inputValueRenderer(selectedItem))
    }
  }, [updateQueryOnSelect, selectedItem, inputValueRenderer])

  return (
    <Suggest2<T>
      ref={ref}
      items={filteredItems}
      query={query}
      onQueryChange={setQuery}
      selectedItem={selectedItem}
      inputValueRenderer={inputValueRenderer}
      inputProps={{
        onKeyDown: (event) => {
          // prevent form submission
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        },
        rightElement: (
          <FieldResetButton
            disabled={
              fieldState
                ? !fieldState.isDirty
                : onReset
                  ? !(query || selectedItem !== null)
                  : true
            }
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
