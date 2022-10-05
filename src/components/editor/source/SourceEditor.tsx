import { Callout } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import camelcaseKeys from 'camelcase-keys'
import { FC, useEffect, useMemo, useState } from 'react'
import { UseFormReturn, useWatch } from 'react-hook-form'

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
    control,
    getValues,
    reset,
    formState: { errors },
  },
  triggerValidation,
}) => {
  const hasErrors = !!Object.keys(errors).length

  const initialText = useMemo(() => {
    try {
      const initialOperation = getValues()
      return JSON.stringify(toMaaOperation(initialOperation), null, 2)
    } catch (e) {
      console.warn(e)
      return '(解析时出现错误)'
    }
  }, [getValues])

  // use useWatch instead of form.watch because the latter will cause infinite loop when using with useEffect
  const operation = useWatch({ control })

  useEffect(() => {
    triggerValidation()
  }, [operation])

  const [text, setText] = useState(initialText)
  const [isInvalidJson, setIsInvalidJson] = useState(false)

  const handleChange = (text: string) => {
    try {
      setIsInvalidJson(false)
      reset(toEditableOperation(camelcaseKeys(JSON.parse(text))))
    } catch (e) {
      setIsInvalidJson(true)
    }
  }

  return (
    <OperationDrawer
      title={<SourceEditorHeader text={text} onChange={setText} />}
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
              title={'JSON 验证：' + (isInvalidJson ? '语法错误' : '通过')}
              intent={isInvalidJson ? 'warning' : 'success'}
            />
          </div>
          <Tooltip2
            className="flex-1"
            content="请在表单中查看错误信息"
            position="bottom"
            disabled={!hasErrors}
          >
            <Callout
              title={'表单验证：' + (hasErrors ? '未通过' : '通过')}
              intent={hasErrors ? 'warning' : 'success'}
            />
          </Tooltip2>
        </div>
        <textarea
          className="mt-4 flex-grow bg-white text-xm font-mono resize-none"
          defaultValue={text}
          onBlur={(e) => handleChange(e.target.value)}
        />
      </div>
    </OperationDrawer>
  )
}
