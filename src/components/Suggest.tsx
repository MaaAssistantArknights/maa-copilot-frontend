import { Suggest2, Suggest2Props } from '@blueprintjs/select'

import { debounce, noop } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ControllerFieldState } from 'react-hook-form'

import { FieldResetButton } from './FieldResetButton'

interface SuggestProps<T> extends Suggest2Props<T> {
  query?: string // controlled query, optional
  debounce?: number // defaults to 100(ms)
  updateQueryOnSelect?: boolean
  fieldState?: ControllerFieldState
  onDebouncedQueryChange?: (query: string) => void
  onReset?: () => void
}

export const Suggest = <T,>({
  debounce: debounceTime = 100,
  updateQueryOnSelect,
  fieldState,
  query: propQuery,
  onQueryChange,
  onDebouncedQueryChange,
  onReset,

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

  const onQueryChangeRef = useRef(onQueryChange)
  onQueryChangeRef.current = onQueryChange
  const onDebouncedQueryChangeRef = useRef(onDebouncedQueryChange)
  onDebouncedQueryChangeRef.current = onDebouncedQueryChange

  const [internalQuery, setInternalQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const query = propQuery ?? internalQuery
  const updateQuery = useMemo(() => {
    // note: debouncing is required to fix https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/72
    const debouncedUpdateQuery = debounce((query: string) => {
      setDebouncedQuery(query)
      onDebouncedQueryChangeRef.current?.(query)
    }, debounceTime)

    const updateQuery = (query: string, immediately: boolean) => {
      setInternalQuery(query)
      onQueryChangeRef.current?.(query)
      debouncedUpdateQuery(query)
      if (immediately) {
        debouncedUpdateQuery.flush()
      }
    }
    updateQuery.cancel = debouncedUpdateQuery.cancel
    return updateQuery
  }, [debounceTime])

  // 取消等待中的调用
  useEffect(() => () => updateQuery.cancel(), [updateQuery])

  useEffect(() => {
    if (fieldState && !fieldState.isTouched) {
      updateQuery('', true)
    }
  }, [fieldState, updateQuery])

  useEffect(() => {
    if (updateQueryOnSelect && selectedItem) {
      updateQuery(inputValueRenderer(selectedItem), true)
    }
  }, [updateQueryOnSelect, selectedItem, inputValueRenderer, updateQuery])

  return (
    <Suggest2<T>
      ref={ref}
      query={query}
      onQueryChange={(query) => updateQuery(query, false)}
      selectedItem={selectedItem}
      inputValueRenderer={inputValueRenderer}
      itemListPredicate={
        itemListPredicate
          ? (query, items) => itemListPredicate(debouncedQuery, items)
          : undefined
      }
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
              !(
                // enabled =
                (fieldState
                  ? fieldState.isDirty
                  : onReset
                    ? query || selectedItem !== null
                    : false)
              )
            }
            onReset={() => {
              updateQuery('', true)
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
