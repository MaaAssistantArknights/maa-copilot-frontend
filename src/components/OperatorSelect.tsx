import { MenuItem } from '@blueprintjs/core'
import { MultiSelect2 } from '@blueprintjs/select'

import Fuse from 'fuse.js'
import { compact } from 'lodash-es'
import { FC, useMemo, useRef } from 'react'

import { OPERATORS } from '../models/operator'
import { OperatorAvatar } from './editor/operator/EditorOperator'

interface OperatorSelectProps {
  className?: string
  operators: string[]
  onChange: (operators: string[]) => void
}

type OperatorInfo = typeof OPERATORS[number]

interface OperatorEntry {
  name: string
  exclude?: boolean
}

export const OperatorSelect: FC<OperatorSelectProps> = ({
  className,
  operators: _operators,
  onChange,
}) => {
  const operators: OperatorEntry[] = useMemo(
    () =>
      _operators.map((name) => ({
        exclude: name.startsWith('~'),
        name: name.replace('~', ''),
      })),
    [_operators],
  )

  const fuse = useMemo(
    () =>
      new Fuse(OPERATORS, {
        keys: ['name', 'pron'],
        threshold: 0.3,
      }),
    [],
  )

  const selectedItems = useMemo(
    () =>
      compact(
        operators.map(({ name }) =>
          OPERATORS.find((item) => item.name === name),
        ),
      ),
    [operators],
  )

  const isRemoving = useRef(false)

  const change = (items: OperatorEntry[]) => {
    onChange(
      compact(
        items.map((item) => (item?.exclude ? `~${item.name}` : item.name)),
      ),
    )
  }

  const setExclude = (index: number, exclude: boolean) => {
    // clicking on the tag's X button will also trigger this, so we need to check
    // if the item is already being removed to prevent re-adding it back
    if (isRemoving.current) {
      isRemoving.current = false
      return
    }

    change(
      operators.map((item, i) => (i === index ? { ...item, exclude } : item)),
    )
  }

  const add = (operation: OperatorInfo) => {
    change([...new Set([...operators, { name: operation.name }])])
  }

  const remove = (operation: OperatorInfo) => {
    isRemoving.current = true
    change(operators.filter((op) => op.name !== operation.name))
  }

  const clear = () => {
    change([])
  }

  return (
    <MultiSelect2<OperatorInfo>
      className={className}
      items={OPERATORS}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          key={item.name}
          text={item.name}
          icon={<OperatorAvatar id={item.id} size="small" />}
          onClick={handleClick}
          onFocus={handleFocus}
          selected={modifiers.active}
          disabled={modifiers.disabled}
        />
      )}
      itemListPredicate={(query) => {
        if (!query) {
          return OPERATORS
        }
        return fuse.search(query).map((el) => el.item)
      }}
      selectedItems={selectedItems}
      placeholder="包含或排除干员"
      noResults={<MenuItem disabled text={`没有匹配的干员`} />}
      tagInputProps={{
        leftIcon: 'person',
        className: '!flex !p-0 !pl-[5px]',
        large: true,
        tagProps(value, index) {
          const operator = operators[index]

          return {
            interactive: true,
            intent: operator?.exclude ? 'danger' : 'primary',
            onClick: () => setExclude(index, !operator?.exclude),
          }
        },
      }}
      resetOnSelect={true}
      tagRenderer={(item) => item.name}
      popoverProps={{
        placement: 'bottom-start',
      }}
      onItemSelect={add}
      onRemove={remove}
      onClear={clear}
    />
  )
}
