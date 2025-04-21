import { Classes, Icon, MenuDivider, MenuItem } from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { atom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { uniqueId } from 'lodash-es'
import { FC, ReactNode, memo, useMemo, useState } from 'react'

import { OPERATORS, OperatorInfo } from '../../../models/operator'
import { useDebouncedQuery } from '../../../utils/useDebouncedQuery'
import { Select } from '../../Select'
import { OperatorAvatar } from '../../editor/operator/EditorOperator'
import { editorAtoms } from '../editor-state'

const createArbitraryOperator = (name: string): OperatorInfo => ({
  id: '',
  name,
  alias: '',
  alt_name: '',
  subProf: '',
  prof: '',
  rarity: 0,
  skills: [],
})

const operatorNamesAtom = selectAtom(
  editorAtoms.operators,
  (operators) => operators.map((op) => op.name),
  (a, b) => a.join() === b.join(),
)
const groupNamesAtom = selectAtom(
  editorAtoms.groups,
  (groups) => groups.map((g) => g.name),
  (a, b) => a.join() === b.join(),
)
const groupedOperatorNamesAtom = selectAtom(
  editorAtoms.groups,
  (groups) => groups.flatMap((g) => g.opers).map((op) => op.name),
  (a, b) => a.join() === b.join(),
)
// 不需要某个 atom 时用来占位，避免不必要的渲染
const dummyArrayAtom = atom<string[]>([])

interface OperatorSelectProps {
  liftPicked?: boolean
  markPicked?: boolean
  value?: string
  onSelect?: (value: string) => void
  children: ReactNode
}

export const OperatorSelect: FC<OperatorSelectProps> = memo(
  ({ liftPicked, markPicked, value, onSelect, children }) => {
    const operatorNames = useAtomValue(operatorNamesAtom)
    const groupNames = useAtomValue(
      liftPicked ? groupNamesAtom : dummyArrayAtom,
    )
    const groupedOperatorNames = useAtomValue(
      markPicked ? groupedOperatorNamesAtom : dummyArrayAtom,
    )
    const overallOperatorNames = [...operatorNames, ...groupedOperatorNames]

    const [isOpen, setIsOpen] = useState(false)

    const isGroup = (name?: string) =>
      name !== undefined && groupNames.includes(name)

    type Item = (OperatorInfo | { name: string }) & { isHeader?: boolean }
    const items: Item[] = useMemo(() => {
      if (!isOpen) return []
      if (!liftPicked) return OPERATORS
      // 把已选择的干员和干员组放在前面
      const pickedOperators = operatorNames.map((name) => ({ name }))
      const unpickedOperators = pickedOperators.length
        ? OPERATORS.filter((op) => !operatorNames.includes(op.name))
        : OPERATORS
      const items: Item[] = [
        ...groupNames.map((name) => ({ name })),
        ...pickedOperators,
      ]
      if (items.length > 0) {
        items.push({ name: uniqueId(), isHeader: true })
      }
      items.push(...unpickedOperators)
      return items
    }, [operatorNames, groupNames, isOpen, liftPicked])

    const fuse = useMemo(
      () =>
        new Fuse(items, {
          keys: ['name', 'alias', 'alt_name'],
          threshold: 0.3,
        }),
      [items],
    )

    const { query, trimmedDebouncedQuery, updateQuery, onOptionMouseDown } =
      useDebouncedQuery()

    const filteredItems = useMemo(
      () =>
        trimmedDebouncedQuery
          ? fuse.search(trimmedDebouncedQuery).map((el) => el.item)
          : items,
      [items, fuse, trimmedDebouncedQuery],
    )

    return (
      <Select<Item>
        query={query}
        className="inline"
        onQueryChange={(query) => updateQuery(query, false)}
        items={OPERATORS}
        itemDisabled={(item) => !!item.isHeader}
        itemRenderer={(item, { index, handleClick, handleFocus, modifiers }) =>
          item.isHeader ? (
            <MenuDivider key={item.name} />
          ) : (
            <MenuItem
              roleStructure="listoption"
              className={clsx(
                'py-0 items-center',
                modifiers.active && Classes.ACTIVE,
              )}
              // item 是 group 时要处理 name 是空字符串以及 name 与干员或其他 group 重名的情况，
              // 所以干脆用 index 作为 key 了
              key={
                isGroup(item.name) ? index : 'id' in item ? item.id : item.name
              }
              text={
                <div className="flex items-center gap-2">
                  {isGroup(item.name) ? (
                    <OperatorAvatar
                      className="w-8 h-8 leading-3"
                      fallback={
                        <Icon
                          icon="people"
                          size={20}
                          className="align-middle"
                        />
                      }
                    />
                  ) : (
                    <OperatorAvatar
                      className="w-8 h-8 leading-3"
                      id={'id' in item ? item.id : undefined}
                      name={item.name}
                    />
                  )}
                  {item.name}
                </div>
              }
              onClick={handleClick}
              onFocus={handleFocus}
              onMouseDown={onOptionMouseDown}
              selected={
                value === item.name ||
                (markPicked && overallOperatorNames.includes(item.name))
              }
              labelElement={
                markPicked && overallOperatorNames.includes(item.name) ? (
                  <Icon icon="tick" />
                ) : undefined
              }
              disabled={modifiers.disabled}
            />
          )
        }
        itemListPredicate={() => filteredItems}
        createNewItemFromQuery={(query) => createArbitraryOperator(query)}
        createNewItemRenderer={(query, active, handleClick) => (
          <MenuItem
            key="create-new-item"
            roleStructure="listoption"
            text={`使用自定义干员 "${query}"`}
            className={clsx('py-0 items-center', active && Classes.ACTIVE)}
            icon="text-highlight"
            onClick={handleClick}
          />
        )}
        inputProps={{
          placeholder: '搜索干员',
        }}
        resetOnSelect={true}
        popoverProps={{
          placement: 'right-start',
          onOpening: () => setIsOpen(true),
          onClosed: () => setIsOpen(false),
        }}
        onItemSelect={(item) => onSelect?.(item.name)}
      >
        {children}
      </Select>
    )
  },
)
OperatorSelect.displayName = 'OperatorSelect'
