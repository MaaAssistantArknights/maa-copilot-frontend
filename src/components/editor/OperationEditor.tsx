import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  H4,
  Icon,
  InputGroup,
  MenuItem,
  TextArea,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { useLevels } from 'apis/arknights'
import clsx from 'clsx'
import Fuse from 'fuse.js'
import { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Control,
  FieldErrors,
  UseFormReturn,
  useController,
  useWatch,
} from 'react-hook-form'

import { FormField, FormField2 } from 'components/FormField'
import { HelperText } from 'components/HelperText'
import type { CopilotDocV1 } from 'models/copilot.schema'
import { Level, OpDifficulty, OpDifficultyBitFlag } from 'models/operation'

import {
  createCustomLevel,
  findLevelByStageName,
  getPrtsMapUrl,
  getStageIdWithDifficulty,
  hasHardMode,
  isHardMode,
  toNormalMode,
} from '../../models/level'
import { useBreakpoint } from '../../utils/device'
import { formatError } from '../../utils/error'
import { Suggest } from '../Suggest'
import { EditorActions } from './action/EditorActions'
import { FloatingMap } from './floatingMap/FloatingMap'
import {
  FloatingMapContext,
  useFloatingMap,
} from './floatingMap/FloatingMapContext'
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
  const { data, error: _levelError, isValidating } = useLevels()
  const loading = isValidating && !data
  const levelError =
    _levelError && (data ? '更新关卡失败：' : '') + formatError(_levelError)

  const levels = useMemo(
    () =>
      data?.data
        // to simplify the list, we only show levels in normal mode
        .filter((level) => !isHardMode(level.stageId))
        .sort((a, b) => a.levelId.localeCompare(b.levelId)) || [],
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
        ? findLevelByStageName(levels, value) || createCustomLevel(value)
        : // return null to ensure the component is controlled
          null,
    [levels, value],
  )

  const difficulty = useWatch({ control, name: 'difficulty' })
  const prtsMapUrl = selectedLevel
    ? getPrtsMapUrl(
        getStageIdWithDifficulty(
          selectedLevel.stageId,
          difficulty ?? OpDifficulty.UNKNOWN,
        ),
      )
    : undefined

  // stageName should always be in normal mode
  const selectLevel = (level: Level) => onChange(toNormalMode(level.stageId))

  const { setLevel } = useFloatingMap()

  useEffect(() => {
    setLevel(selectedLevel || undefined)
  }, [selectedLevel, setLevel])

  return (
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
      <div className="flex">
        <Suggest<Level>
          items={levels}
          itemListPredicate={(query) =>
            query ? fuse.search(query).map((el) => el.item) : levels
          }
          fieldState={fieldState}
          onReset={() => onChange('')}
          className={clsx('flex-grow mr-2', loading && 'bp4-skeleton')}
          disabled={loading}
          itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
            <MenuItem
              key={item.stageId}
              text={`${item.catThree} ${item.name}`}
              onClick={handleClick}
              onFocus={handleFocus}
              selected={modifiers.active}
              disabled={modifiers.disabled}
            />
          )}
          selectedItem={selectedLevel}
          onItemSelect={selectLevel}
          inputValueRenderer={(item) => `${item.catThree} ${item.name}`}
          noResults={<MenuItem disabled text="没有匹配的关卡" />}
          createNewItemFromQuery={(query) => createCustomLevel(query)}
          createNewItemRenderer={(query, active, handleClick) => (
            <MenuItem
              key="create-new-item"
              text={`使用自定义关卡名 "${query}"`}
              icon="text-highlight"
              onClick={handleClick}
              selected={active}
            />
          )}
          inputProps={{
            placeholder: '关卡',
            large: true,
            onBlur,
          }}
        />
        <Tooltip2 placement="top" content="在 PRTS.Map 中查看关卡">
          <AnchorButton
            large
            icon="share"
            target="_blank"
            href={prtsMapUrl}
            disabled={!prtsMapUrl}
          />
        </Tooltip2>
      </div>
    </FormField2>
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

  const stageName = useWatch({ control, name: 'stageName' })
  const levels = useLevels().data?.data || []
  const invalid = useMemo(
    () => !hasHardMode(levels, stageName),
    [levels, stageName],
  )

  useEffect(() => {
    if (invalid && value !== OpDifficulty.UNKNOWN) {
      onChange(OpDifficulty.UNKNOWN)
    }
  }, [invalid, value, onChange])

  const toggle = (bit: OpDifficultyBitFlag) => {
    onChange(value ^ bit)
  }

  return (
    <FormField2
      label="关卡难度"
      description="在作业上显示的难度标识，如果不选择则不显示"
      FormGroupProps={{
        helperText: invalid ? '该关卡没有突袭难度，无需选择' : '',
      }}
      field="difficulty"
      error={error}
    >
      <ButtonGroup>
        <Button
          disabled={invalid}
          active={!!(value & OpDifficultyBitFlag.REGULAR)}
          onClick={() => toggle(OpDifficultyBitFlag.REGULAR)}
        >
          普通
        </Button>
        <Button
          disabled={invalid}
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
  const levels = useLevels().data?.data || []

  const stageName = watch('stageName')

  const breakpoint = useBreakpoint()

  // set default title if not set
  useEffect(() => {
    if (!getValues('doc.title')) {
      const level = findLevelByStageName(levels, stageName)

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
    <FloatingMapContext>
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

        {breakpoint !== 'tablet' && <FloatingMap />}
      </section>
    </FloatingMapContext>
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
