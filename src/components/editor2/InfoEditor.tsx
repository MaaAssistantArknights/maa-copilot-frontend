import {
  Callout,
  FormGroup,
  InputGroup,
  Radio,
  RadioGroup,
  TextArea,
} from '@blueprintjs/core'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { memo } from 'react'
import { Paths } from 'type-fest'

import { DifficultyPicker } from './DifficultyPicker'
import { LevelSelect } from './LevelSelect'
import { editorAtoms, useEdit } from './editor-state'
import { CopilotOperation, getLabeledPath } from './validation/schema'
import { editorVisibleGlobalErrorsAtom } from './validation/validation'

interface InfoEditorProps {
  className?: string
}

export const InfoEditor = memo(({ className }: InfoEditorProps) => {
  const [info, setInfo] = useImmerAtom(editorAtoms.operationBase)
  const [metadata, setMetadata] = useImmerAtom(editorAtoms.metadata)
  const edit = useEdit()

  return (
    <div
      className={clsx(
        'p-4 md:[&>.bp4-form-group]:flex-row md:[&>.bp4-form-group>.bp4-label]:w-20',
        '[&_[type="text"]]:!border-0 [&_textarea]:!outline-none [&_[type="text"]]:shadow-[inset_0_0_2px_0_rgba(0,0,0,0.4)] [&_textarea:not(:focus)]:!shadow-[inset_0_0_2px_0_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      <h3 className="mb-2 text-lg font-bold">作业信息</h3>
      <FormGroup contentClassName="grow" label="标题" labelInfo="*">
        <InputGroup
          large
          fill
          placeholder="起一个引人注目的标题吧"
          value={info.doc?.title || ''}
          onChange={(e) => {
            edit(() => {
              setInfo((prev) => {
                prev.doc.title = e.target.value
              })
              return {
                action: 'update-title',
                desc: '修改标题',
                squash: true,
              }
            })
          }}
        />
        <FieldError path="doc.title" />
      </FormGroup>
      <FormGroup contentClassName="grow" label="描述">
        <TextArea
          fill
          rows={4}
          large
          placeholder="如：作者名、参考的视频攻略链接（如有）等"
          value={info.doc?.details || ''}
          onChange={(e) => {
            edit(() => {
              setInfo((prev) => {
                prev.doc.details = e.target.value
              })
              return {
                action: 'update-details',
                desc: '修改描述',
                squash: true,
              }
            })
          }}
        />
        <FieldError path="doc.details" />
      </FormGroup>
      <FormGroup contentClassName="grow" label="关卡" labelInfo="*">
        <LevelSelect
          difficulty={info.difficulty}
          value={info.stageName}
          onChange={(value) => {
            edit(() => {
              setInfo((prev) => {
                prev.stageName = value
              })
              return {
                action: 'update-level',
                desc: '修改关卡',
                squash: false,
              }
            })
          }}
        />
        <FieldError path="stage_name" />
      </FormGroup>
      <FormGroup contentClassName="grow" label="适用难度">
        <DifficultyPicker
          stageName={info.stageName}
          onChange={(value, programmatically) => {
            edit((get, set, skip) => {
              setInfo((prev) => {
                prev.difficulty = value
              })
              // 如果是由于关卡变化而导致的难度变化，则不需要 checkpoint
              if (programmatically) {
                return skip
              }
              return {
                action: 'update-difficulty',
                desc: '修改难度',
                squash: false,
              }
            })
          }}
        />
        <FieldError path="difficulty" />
      </FormGroup>
      <FormGroup className="mb-0" contentClassName="grow" label="可见范围">
        <RadioGroup
          inline
          selectedValue={metadata.visibility}
          onChange={(e) => {
            edit(() => {
              setMetadata((prev) => {
                prev.visibility = e.currentTarget.value as 'public' | 'private'
              })
              return {
                action: 'update-visibility',
                desc: '修改可见范围',
                squash: true,
              }
            })
          }}
        >
          <Radio className="!mt-0" value="public">
            公开
          </Radio>
          <Radio className="!mt-0" value="private">
            仅自己可见
            <span className="ml-2 text-xs opacity-50">
              其他人无法在列表中看见，但可以通过神秘代码访问
            </span>
          </Radio>
        </RadioGroup>
      </FormGroup>
    </div>
  )
})
InfoEditor.displayName = 'InfoEditor'

const FieldError = ({ path }: { path: Paths<CopilotOperation> }) => {
  const globalErrors = useAtomValue(editorVisibleGlobalErrorsAtom)
  const errors = globalErrors?.filter((e) => e.path.join('.') === path)
  if (!errors?.length) return null
  return (
    <Callout intent="danger" icon={null} className="mt-1 p-2 text-xs">
      {errors.map(({ path, message }) => (
        <p key={path.join()}>
          {getLabeledPath(path)}: {message}
        </p>
      ))}
    </Callout>
  )
}
