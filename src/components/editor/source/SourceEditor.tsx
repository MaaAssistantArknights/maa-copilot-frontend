import { Callout } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import camelcaseKeys from 'camelcase-keys'
import { FC, useEffect, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { CopilotDocV1 } from '../../../models/copilot.schema'
import { OperationDrawer } from '../../drawer/OperationDrawer'
import { toEditableOperation, toMaaOperation } from '../converter'
import { SourceEditorHeader } from './SourceEditorHeader'

export interface SourceEditorProps {
  form: UseFormReturn<CopilotDocV1.Operation>
  triggerValidation: () => void
}

export const SourceEditor: FC<SourceEditorProps> = ({
  form: {
    getValues,
    watch,
    reset,
    formState: { errors },
  },
  triggerValidation,
}) => {
  const hasValidationErrors = !!Object.keys(errors).length

  const initialText = useMemo(() => {
    try {
      const initialOperation = getValues()
      return JSON.stringify(toMaaOperation(initialOperation), null, 2)
    } catch (e) {
      console.warn(e)
      return '(解析时出现错误)'
    }
  }, [getValues])

  // use watch + callback instead of watch + useEffect because the latter will cause infinite re-render due to unstable reference
  useEffect(() => {
    const { unsubscribe } = watch(triggerValidation)
    return () => unsubscribe()
  }, [watch])

  const [text, setText] = useState(initialText)
  const [jsonError, setJsonError] = useState<string>()

  const handleChange = (text: string) => {
    try {
      setJsonError(undefined)

      const json = JSON.parse(text)
      reset(toEditableOperation(camelcaseKeys(json)))
    } catch (e) {
      if (e instanceof SyntaxError) {
        setJsonError('存在语法错误')
      } else {
        // this will most likely not happen
        console.warn(e)
        setJsonError('存在结构错误')
      }
    }
  }

  return (
    <OperationDrawer
      title={
        <SourceEditorHeader
          text={text}
          onChange={(text) => {
            setText(text)
            handleChange(text)
          }}
        />
      }
    >
      <div className="px-8 py-4 flex-grow flex flex-col bg-zinc-50">
        <Callout
          className=" [&_h4]:text-sm"
          intent="primary"
          title="在此处编辑 JSON 将会实时更新表单"
        />
        <div className="mt-2 flex flex-wrap gap-2 [&_h4]:text-sm">
          {/* wrap in an extra div to work around a flex bug, where the children's sizes are uneven when using flex-1.
              refer to: https://github.com/philipwalton/flexbugs#flexbug-7 */}
          <div className="flex-1">
            <Callout
              title={'JSON 验证：' + (jsonError ? '语法错误' : '通过')}
              intent={jsonError ? 'warning' : 'success'}
            />
          </div>
          <Tooltip2
            className="flex-1"
            content="请在表单中查看错误信息"
            position="bottom"
            disabled={!hasValidationErrors}
          >
            <Callout
              title={'表单验证：' + (hasValidationErrors ? '未通过' : '通过')}
              intent={hasValidationErrors ? 'warning' : 'success'}
            />
          </Tooltip2>
        </div>
        <textarea
          className="mt-4 p-1 flex-grow bg-white text-xm font-mono resize-none focus:outline focus:outline-2 focus:outline-blue-300"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => handleChange(e.target.value)}
        />
      </div>
    </OperationDrawer>
  )
}
