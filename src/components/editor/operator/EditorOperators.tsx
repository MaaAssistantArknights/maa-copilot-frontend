import { Button, Card, HTMLSelect, MenuItem } from '@blueprintjs/core'
import { Suggest2 } from '@blueprintjs/select'
import { CardTitle } from 'components/CardTitle'
import {
  DetailedSelect,
  DetailedSelectChoice,
  DetailedSelectItem,
} from 'components/editor/DetailedSelect'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { EditorResetButton } from 'components/editor/EditorResetButton'
import { FormField2 } from 'components/FormField'
import Fuse from 'fuse.js'
import { OPERATORS } from 'models/generated/operators'
import { FC, useMemo, useState } from 'react'
import {
  Control,
  FormState,
  SubmitHandler,
  useController,
  UseFieldArrayAppend,
  useForm,
} from 'react-hook-form'
import { EditorOperatorSkill } from './EditorOperatorSkill'
import {
  EditorPerformerGroup,
  EditorPerformerProps,
} from './EditorPerformerGroup'

export interface EditorPerformerAddProps {
  append: UseFieldArrayAppend<CopilotDocV1.Operator | CopilotDocV1.Group>
}

export const EditorPerformerAdd = ({ append }: EditorPerformerAddProps) => {
  const [mode, setMode] = useState<'operator' | 'group'>('operator')

  const selector = (
    <>
      添加
      <HTMLSelect
        className="ml-1"
        onChange={(e) => {
          console.log('selected', e.target.value)
          setMode(e.target.value as 'operator' | 'group')
        }}
        value={mode}
      >
        <option value="operator">干员</option>
        <option value="group">干员组</option>
      </HTMLSelect>
    </>
  )

  const child = useMemo(() => {
    return mode === 'operator' ? (
      <EditorPerformerOperator
        submit={(values) => {
          append(values)
        }}
        categorySelector={selector}
      />
    ) : (
      <EditorPerformerGroup
        submit={(values) => {
          append(values)
        }}
        categorySelector={selector}
      />
    )
  }, [mode])

  return <Card className="mb-8">{child}</Card>
}

const EditorPerformerOperator = ({
  submit,
  categorySelector,
}: EditorPerformerProps) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Operator>()

  const onSubmit: SubmitHandler<CopilotDocV1.Operator> = (values) => {
    submit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center mb-4">
        <CardTitle className="mb-0" icon="add">
          {categorySelector}
        </CardTitle>

        <div className="flex-1" />

        <EditorResetButton<CopilotDocV1.Operator>
          reset={reset}
          entityName="干员"
        />
      </div>

      <EditorOperator control={control} errors={errors} />

      <Button
        disabled={!isValid && !isDirty}
        intent="primary"
        type="submit"
        icon="add"
      >
        添加
      </Button>
    </form>
  )
}

const EditorOperator: FC<{
  control: Control<CopilotDocV1.Operator>
  errors: FormState<CopilotDocV1.Operator>['errors']
}> = ({ control, errors }) => {
  return (
    <>
      <FormField2
        label="干员名"
        description="选择干员或直接使用搜索内容创建干员 "
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
          <EditorOperatorSkill<CopilotDocV1.Operator>
            control={control}
            name="skill"
          />
        </FormField2>

        <FormField2
          label="技能用法"
          field="skillUsage"
          error={errors.skillUsage}
        >
          <EditorOperatorSkillUsage<CopilotDocV1.Operator>
            control={control}
            name="skillUsage"
          />
        </FormField2>
      </div>
    </>
  )
}

const createArbitraryOperator = (name: string): typeof OPERATORS[number] => ({
  name,
  pron: '',
})

const EditorOperatorName = <T,>({ name, control }: EditorFieldProps<T>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController<T>({
    name,
    control,
    rules: { required: '请输入干员名' },
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

const EditorOperatorSkillUsage = <T,>({
  name,
  control,
}: EditorFieldProps<T>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
  })

  const menuItems = useMemo<DetailedSelectItem[]>(
    () => [
      {
        type: 'choice',
        icon: 'disable',
        title: '不自动使用',
        value: 0,
        description:
          '不由 MAA Copilot 自动开启技能、或干员技能并不需要操作开启（自动触发）。若需要手动开启技能，请添加「使用技能」动作',
      },
      {
        type: 'choice',
        icon: 'automatic-updates',
        title: '好了就用，有多少次用多少次',
        value: 1,
        description: '例如：棘刺 3 技能、桃金娘 1 技能等',
      },
      {
        type: 'choice',
        icon: 'circle',
        title: '好了就用，仅使用一次',
        value: 2,
        description: '例如：山 2 技能',
      },
      {
        type: 'choice',
        icon: 'predictive-analysis',
        title: '自动判断使用时机',
        value: 3,
        description: '(锐意开发中) 画饼.jpg',
        disabled: true,
      },
    ],
    [],
  )

  const selectedAction = menuItems.find(
    (action) => action.type === 'choice' && action.value === (value ?? 0),
  ) as DetailedSelectChoice | undefined

  return (
    <DetailedSelect
      items={menuItems}
      onItemSelect={(item) => {
        onChange(item.value)
      }}
      activeItem={selectedAction}
    >
      <Button
        icon={selectedAction?.icon || 'slash'}
        text={selectedAction ? selectedAction.title : '选择技能用法'}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </DetailedSelect>
  )
}
