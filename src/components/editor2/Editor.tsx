import {
  Callout,
  Divider,
  FormGroup,
  InputGroup,
  Radio,
  RadioGroup,
  TextArea,
} from '@blueprintjs/core'

import { FC, useState } from 'react'
import { Controller, FieldErrors, useFormContext } from 'react-hook-form'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { DifficultyPicker } from './DifficultyPicker'
import { EditorToolbar } from './EditorToolbar'
import { LevelSelect } from './LevelSelect'
import { OperatorPanel } from './OperatorPanel'
import { editorStateAtom, useAtomHistory } from './editor-state'
import { OperatorSheet } from './operator/sheet/OperatorSheet'

interface OperationEditorProps {
  title?: string
  submitAction: string
  onSubmit: () => void
}

const tabs = [
  { id: 'main', name: '作业信息' },
  { id: 'actions', name: '动作序列' },
]

export const OperationEditor: FC<OperationEditorProps> = ({
  title,
  submitAction,
  onSubmit,
}) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0].id)
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<CopilotDocV1.Operation>()
  const { state, update, checkpoint } = useAtomHistory(editorStateAtom)

  const globalError = (errors as FieldErrors<{ global: void }>).global?.message
  const [stageName, difficulty] = watch(['stageName', 'difficulty'])

  return (
    <div className="copilot-editor h-[calc(100vh-3.5rem)] flex flex-col">
      <EditorToolbar
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        title={title}
        submitAction={submitAction}
        onSubmit={onSubmit}
      />
      {globalError && (
        <Callout className="mt-4" intent="danger" icon="error" title="错误">
          {globalError.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Callout>
      )}

      <div className="grow min-h-0 flex">
        <div className="flex-1">
          <OperatorSheet />
        </div>
        <Divider className="m-0" />
        <div className="flex-1 p-4 pr-8 overflow-auto">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">作业信息</h2>
            <Divider className="grow" />
          </div>
          <div className="mb-4 [&>.bp4-inline>.bp4-label]:w-20">
            <FormGroup
              inline
              contentClassName="grow"
              label="标题"
              labelInfo="*"
            >
              <Controller
                name="doc.title"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    large
                    fill
                    placeholder="起一个引人注目的标题吧"
                    {...field}
                    onChange={(e) => {
                      checkpoint('update-title', '修改标题', false)
                      field.onChange(e)
                    }}
                    value={field.value || ''}
                  />
                )}
              />
            </FormGroup>
            <FormGroup inline contentClassName="grow" label="描述">
              <Controller
                name="doc.details"
                control={control}
                render={({ field }) => (
                  <TextArea
                    fill
                    rows={4}
                    growVertically
                    large
                    placeholder="如：作者名、参考的视频攻略链接（如有）等"
                    {...field}
                    onChange={(e) => {
                      checkpoint('update-details', '修改描述', false)
                      field.onChange(e)
                    }}
                    value={field.value || ''}
                  />
                )}
              />
            </FormGroup>
            <FormGroup
              inline
              contentClassName="grow"
              label="关卡"
              labelInfo="*"
            >
              <Controller
                name="stageName"
                control={control}
                render={({ field: { ref, ...field } }) => (
                  <LevelSelect
                    difficulty={difficulty}
                    {...field}
                    inputRef={ref}
                    onChange={(value) => {
                      checkpoint('update-level', '修改关卡', true)
                      field.onChange(value)
                    }}
                  />
                )}
              />
            </FormGroup>
            <FormGroup inline contentClassName="grow" label="适用难度">
              <Controller
                name="difficulty"
                control={control}
                render={({ field: { ref, ...field } }) => (
                  <DifficultyPicker
                    stageName={stageName}
                    {...field}
                    selectRef={ref}
                    onChange={(value, programmatically) => {
                      if (!programmatically) {
                        checkpoint('update-difficulty', '修改难度', true)
                      }
                      field.onChange(value)
                    }}
                  />
                )}
              />
            </FormGroup>
            <FormGroup inline contentClassName="grow" label="可见范围">
              <RadioGroup
                inline
                selectedValue={state.visibility}
                onChange={(e) => {
                  checkpoint('update-visibility', '修改可见范围', true)
                  update((prev) => ({
                    ...prev,
                    visibility: e.currentTarget.value as 'public' | 'private',
                  }))
                }}
              >
                <Radio value="public">公开</Radio>
                <Radio value="private">
                  仅自己可见
                  <span className="ml-2 text-xs opacity-50">
                    其他人无法在列表中看见，但可以通过神秘代码访问
                  </span>
                </Radio>
              </RadioGroup>
            </FormGroup>
          </div>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">
              干员与干员组 {state.form.opers?.length}
            </h2>
            <Divider className="grow" />
          </div>
          <OperatorPanel />
        </div>
      </div>
    </div>
  )
}
