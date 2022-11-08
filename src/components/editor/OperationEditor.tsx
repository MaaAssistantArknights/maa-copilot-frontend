import {
  Button,
  ButtonGroup,
  Callout,
  H4,
  Icon,
  InputGroup,
  MenuItem,
  TextArea,
} from '@blueprintjs/core'

import { useLevels } from 'apis/arknights'
import clsx from 'clsx'
import Fuse from 'fuse.js'
import { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Control,
  FieldErrors,
  UseFormReturn,
  useController,
} from 'react-hook-form'

import { FormField, FormField2 } from 'components/FormField'
import { HelperText } from 'components/HelperText'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { Level, OpDifficulty, OpDifficultyBitFlag } from 'models/operation'

import { Suggest } from '../Suggest'
import { EditorActions } from './action/EditorActions'
import {
  EditorPerformer,
  EditorPerformerProps,
} from './operator/EditorPerformer'

export const StageNameInput: FC<{
  control: Control<CopilotDocV1.Operation, object>
}> = ({ control }) => {
  const {
    field: { value, onChange, onBlur },
    fieldState,
  } = useController({
    name: 'stageName',
    control,
    rules: { required: '请输入关卡' },
  })

  // we are going to manually handle loading state so we could show the skeleton state easily,
  // without swapping the actual element.
  const {
    data,
    error: levelError,
    isValidating,
  } = useLevels({ suspense: false })
  const loading = isValidating && !data

  const levels = useMemo(
    () => data?.data.sort((a, b) => a.levelId.localeCompare(b.levelId)) || [],
    [data],
  )

  const fuse = useMemo(
    () =>
      new Fuse(levels, {
        keys: ['name', 'catOne', 'catTwo', 'catThree'],
        threshold: 0.3,
      }),
    [levels],
  )

  const selectedLevel = useMemo(
    () =>
      value
        ? levels.find((level) => level.levelId === value) || {
            catOne: '',
            catTwo: '',
            catThree: '自定义关卡',
            levelId: value,
            name: value,
            width: 0,
            height: 0,
          }
        : null,
    [levels, value],
  )

  return (
    <>
      <FormField2
        label="关卡"
        field="stageName"
        error={levelError || fieldState.error}
        asterisk
        FormGroupProps={{
          helperText: (
            <>
              <p>键入以搜索</p>
              <p>对于主线、活动关卡：键入关卡代号、关卡中文名或活动名称</p>
              <p>对于悖论模拟关卡：键入关卡名或干员名</p>
            </>
          ),
        }}
      >
        <Suggest<Level>
          items={levels}
          itemListPredicate={(query) =>
            query ? fuse.search(query).map((el) => el.item) : levels
          }
          fieldState={fieldState}
          onReset={() => onChange(undefined)}
          className={clsx(loading && 'bp4-skeleton')}
          disabled={loading}
          itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
            <MenuItem
              key={item.levelId}
              text={`${item.catThree} ${item.name}`}
              onClick={handleClick}
              onFocus={handleFocus}
              selected={modifiers.active}
              disabled={modifiers.disabled}
            />
          )}
          selectedItem={selectedLevel}
          onItemSelect={(item) => onChange(item.levelId)}
          inputValueRenderer={(item) => `${item.catThree} ${item.name}`}
          popoverContentProps={{
            className: 'max-h-64 overflow-auto',
          }}
          noResults={<MenuItem disabled text="没有匹配的关卡" />}
          inputProps={{
            placeholder: '关卡',
            large: true,
            onBlur,
          }}
        />
      </FormField2>
    </>
  )
}

const DifficultyPicker: FC<{
  control: Control<CopilotDocV1.Operation>
}> = ({ control }) => {
  const {
    field: { value = OpDifficulty.UNKNOWN, onChange },
    fieldState: { error },
  } = useController({
    name: 'difficulty',
    control,
  })

  const toggle = (bit: OpDifficultyBitFlag) => {
    onChange(value ^ bit)
  }

  return (
    <FormField2
      label="关卡难度"
      FormGroupProps={{
        helperText: '对于没有突袭难度的关卡，建议不选择',
      }}
      field="difficulty"
      error={error}
    >
      <ButtonGroup>
        <Button
          active={!!(value & OpDifficultyBitFlag.REGULAR)}
          onClick={() => toggle(OpDifficultyBitFlag.REGULAR)}
        >
          普通
        </Button>
        <Button
          active={!!(value & OpDifficultyBitFlag.HARD)}
          onClick={() => toggle(OpDifficultyBitFlag.HARD)}
        >
          突袭
        </Button>
      </ButtonGroup>
    </FormField2>
  )
}

export interface OperationEditorProps {
  form: UseFormReturn<CopilotDocV1.Operation>
  toolbar: ReactNode
}

export const OperationEditor: FC<OperationEditorProps> = ({
  form: {
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  },
  toolbar,
}) => {
  const levels = useLevels({ suspense: false }).data?.data || []

  const stageName = watch('stageName')

  // set default title if not set
  useEffect(() => {
    if (!getValues('doc.title')) {
      const level = levels.find(({ levelId }) => levelId === stageName)

      if (level) {
        setValue(
          'doc.title',
          [level.catTwo, level.catThree, level.name]
            .filter(Boolean)
            .join(' - '),
        )
      }
    }
  }, [stageName, levels])

  const globalError = (errors as FieldErrors<{ global: void }>).global?.message

  return (
    <section className="flex flex-col relative h-full pt-4">
      <div className="px-8 text-lg font-medium flex items-center w-full h-12">
        <Icon icon="document" />
        <span className="ml-2 mr-4">作业编辑器</span>
        <div className="flex-1" />

        {toolbar}
      </div>

      {globalError && (
        <Callout className="mt-4" intent="danger" icon="error" title="错误">
          {globalError.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Callout>
      )}

      <div className="py-4 px-8 mr-0.5">
        <H4>作业元信息</H4>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 md:mr-8">
            <StageNameInput control={control} />
          </div>
          <div className="w-full md:w-3/4">
            <FormField
              label="作业标题"
              field="doc.title"
              control={control}
              error={errors.doc?.title}
              ControllerProps={{
                rules: { required: '必须填写标题' },
                render: ({ field }) => (
                  <InputGroup
                    large
                    id="doc.title"
                    placeholder="起一个引人注目的标题吧"
                    {...field}
                    value={field.value || ''}
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 md:mr-8">
            <DifficultyPicker control={control} />
          </div>
          <div className="w-full md:w-3/4">
            <FormField
              label="作业描述"
              field="doc.details"
              control={control}
              error={errors.doc?.details}
              ControllerProps={{
                render: ({ field }) => (
                  <TextArea
                    fill
                    rows={4}
                    growVertically
                    large
                    id="doc.details"
                    placeholder="如：作者名、参考的视频攻略链接（如有）等"
                    {...field}
                    value={field.value || ''}
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6" />

        <div className="flex flex-wrap md:flex-nowrap min-h-[calc(100vh-6rem)]">
          <div className="w-full md:w-1/3 md:mr-8 flex flex-col pb-8">
            <EditorPerformerPanel control={control} />
          </div>
          <div className="w-full md:w-2/3 pb-8">
            <H4>动作序列</H4>
            <HelperText className="mb-4">
              <span>拖拽以重新排序</span>
            </HelperText>
            <EditorActions control={control} />
          </div>
        </div>
      </div>
    </section>
  )
}

const EditorPerformerPanel: FC<EditorPerformerProps> = (props) => {
  const [reload, setReload] = useState(false)

  // temporary workaround for https://github.com/clauderic/dnd-kit/issues/799
  if (reload) {
    setTimeout(() => setReload(false), 100)
    return null
  }

  return (
    <>
      <H4>干员与干员组</H4>
      <HelperText className="mb-4">
        <span>拖拽以重新排序或分配干员</span>
        <span>
          如果拖拽速度过快可能会使动画出现问题，此时请点击
          <Button
            minimal
            className="!inline !p-0 !min-h-0 ![font-size:inherit] !leading-none !align-baseline underline"
            onClick={() => setReload(true)}
          >
            刷新界面
          </Button>
          以修复 （不会丢失数据）
        </span>
      </HelperText>
      <EditorPerformer {...props} />
    </>
  )
}
