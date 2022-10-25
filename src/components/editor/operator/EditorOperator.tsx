import { MenuItem } from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { useMemo } from 'react'
import { FieldValues, useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { OPERATORS } from 'models/generated/operators'

import { Suggest } from '../../Suggest'

const findOperatorIdByName = (name: string) =>
  OPERATORS.find((el) => el.name === name)?.id ?? ''

const createArbitraryOperator = (name: string): typeof OPERATORS[number] => ({
  id: findOperatorIdByName(name),
  name,
  pron: '',
})

export const EditorOperatorName = <T extends FieldValues>({
  name,
  control,
  rules,
  allowOperatorGroups,
  ...controllerProps
}: EditorFieldProps<T, string> & {
  allowOperatorGroups?: boolean
}) => {
  const entityName = useMemo(
    () => (allowOperatorGroups ? '干员或干员组' : '干员'),
    [allowOperatorGroups],
  )

  const {
    field: { onChange, onBlur, value },
    fieldState,
  } = useController({
    name,
    control,
    rules: { required: `请输入${entityName}名`, ...rules },
    ...controllerProps,
  })

  const fuse = useMemo(
    () =>
      new Fuse(OPERATORS, {
        keys: ['name', 'pron'],
        threshold: 0.3,
      }),
    [],
  )

  return (
    <Suggest<typeof OPERATORS[number]>
      items={OPERATORS}
      itemListPredicate={(query) =>
        query ? fuse.search(query).map((el) => el.item) : OPERATORS
      }
      fieldState={fieldState}
      onReset={() => onChange(undefined)}
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
      onItemSelect={(item) => onChange(item.name)}
      selectedItem={createArbitraryOperator(value as string)}
      inputValueRenderer={(item) => item.name}
      createNewItemFromQuery={(query) => createArbitraryOperator(query)}
      createNewItemRenderer={(query, active, handleClick) => (
        <MenuItem
          key="create-new-item"
          text={`使用自定义${entityName}名 "${query}"`}
          icon="text-highlight"
          onClick={handleClick}
          selected={active}
        />
      )}
      popoverContentProps={{
        className: 'max-h-64 overflow-auto',
      }}
      noResults={<MenuItem disabled text={`没有匹配的${entityName}`} />}
      inputProps={{
        placeholder: `${entityName}名`,
        large: true,
        onBlur,
      }}
      popoverProps={{
        placement: 'bottom-start',
      }}
    />
  )
}

export const OperatorAvatar = ({
  id,
  name,
  size,
  className,
}: {
  id?: string
  name?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}) => {
  const foundId = (() => {
    if (id) return id

    if (name) {
      const found = findOperatorIdByName(name)
      if (found) return found
    }

    return ''
  })()

  const sizingClassName =
    {
      small: 'h-5 w-5',
      medium: 'h-6 w-6',
      large: 'h-8 w-8',
    }[size || 'medium'] || 'h-6 w-6'

  return (
    <img
      className={clsx(
        sizingClassName,
        'rounded-md object-cover bp4-elevation-1 bg-slate-100',
        className,
      )}
      src={'/assets/operator-avatars/' + foundId + '.png'}
      alt={id}
      loading="lazy"
    />
  )
}
