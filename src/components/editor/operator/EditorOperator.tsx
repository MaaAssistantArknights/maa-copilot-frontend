import { MenuItem } from '@blueprintjs/core'
import { Suggest2 } from '@blueprintjs/select'
import clsx from 'clsx'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { FormField2 } from 'components/FormField'
import Fuse from 'fuse.js'
import { OPERATORS } from 'models/generated/operators'
import { FC, useMemo } from 'react'
import { Control, FieldValues, FormState, useController } from 'react-hook-form'
import { EditorOperatorSkill } from './EditorOperatorSkill'
import { EditorOperatorSkillUsage } from './EditorOperatorSkillUsage'

export const EditorOperator: FC<{
  control: Control<CopilotDocV1.Operator>
  errors: FormState<CopilotDocV1.Operator>['errors']
}> = ({ control, errors }) => {
  return (
    <>
      <FormField2
        label="干员名"
        description="选择干员或直接使用搜索内容创建干员"
        field="name"
        error={errors.name}
        asterisk
        FormGroupProps={{
          helperText: '键入干员名、拼音或拼音首字母以从干员列表中搜索',
        }}
      >
        <EditorOperatorName control={control} name="name" />
      </FormField2>

      <div className="flex flex-col lg:flex-row">
        <FormField2
          label="技能"
          field="skill"
          error={errors.skill}
          className="mr-2"
        >
          <EditorOperatorSkill control={control} name="skill" />
        </FormField2>

        <FormField2
          label="技能用法"
          field="skillUsage"
          error={errors.skillUsage}
        >
          <EditorOperatorSkillUsage control={control} name="skillUsage" />
        </FormField2>
      </div>
    </>
  )
}

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
  ...controllerProps
}: EditorFieldProps<T, string>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    rules: { required: '请输入干员名', ...rules },
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
    <Suggest2<typeof OPERATORS[number]>
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
      itemPredicate={(query, item) => {
        return item.name === query
      }}
      itemListPredicate={(query) => {
        if (!query) {
          return OPERATORS
        }
        return fuse.search(query).map((el) => el.item)
      }}
      onItemSelect={(item) => {
        onChange(item.name)
      }}
      selectedItem={createArbitraryOperator(value as string)}
      inputValueRenderer={(item) => item.name}
      ref={ref}
      createNewItemFromQuery={(query) => createArbitraryOperator(query)}
      createNewItemRenderer={(query, active, handleClick) => (
        <MenuItem
          key="create-new-item"
          text={`使用自定义干员名 "${query}"`}
          icon="text-highlight"
          onClick={handleClick}
          selected={active}
        />
      )}
      popoverContentProps={{
        className: 'max-h-64 overflow-auto',
      }}
      noResults={<MenuItem disabled text="没有匹配的干员名" />}
      inputProps={{
        placeholder: '干员名',
        large: true,
        onBlur,
      }}
      popoverProps={{
        placement: 'bottom-start',
      }}
      // value={value as string}
      // onChange={onChange}
      // onBlur={onBlur}
      // ref={ref}
      // placeholder="请输入干员名"
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
