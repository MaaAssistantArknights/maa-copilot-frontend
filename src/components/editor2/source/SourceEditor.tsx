import {
  Button,
  ButtonProps,
  Callout,
  Drawer,
  DrawerSize,
} from '@blueprintjs/core'

import camelcaseKeys from 'camelcase-keys'
import { useAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { FC, memo, useMemo, useState } from 'react'

import { CopilotDocV1 } from '../../../models/copilot.schema'
import { formatError } from '../../../utils/error'
import { withSuspensable } from '../../Suspensable'
import { DrawerLayout } from '../../drawer/DrawerLayout'
import { SourceEditorHeader } from '../../editor/source/SourceEditorHeader'
import { editorAtoms, useEditorControls } from '../editor-state'
import { toEditorOperation, toMaaOperation } from '../reconciliation'

const SourceEditor = withSuspensable(() => {
  const { withCheckpoint } = useEditorControls()
  const [operation, setOperation] = useAtom(editorAtoms.operation)
  const [text, setText] = useState(() =>
    JSON.stringify(toMaaOperation(operation), null, 2),
  )
  const [jsonError, setJsonError] = useState<string>()

  const handleChange = useMemo(
    () =>
      debounce((text: string) => {
        try {
          setJsonError(undefined)

          const json = JSON.parse(text) as CopilotDocV1.OperationSnakeCased
          withCheckpoint(() => {
            setOperation(toEditorOperation(camelcaseKeys(json, { deep: true })))
            return {
              action: 'edit-json',
              desc: '编辑 JSON',
              squash: true,
            }
          })
        } catch (e) {
          if (e instanceof SyntaxError) {
            setJsonError('存在语法错误')
          } else {
            // this can happen if the conversion did not succeed
            setJsonError('存在结构错误: ' + formatError(e))
          }
        }
      }, 1000),
    [withCheckpoint, setOperation],
  )

  return (
    <DrawerLayout
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
      <div className="px-8 py-4 flex-grow flex flex-col gap-2 bg-zinc-50 dark:bg-slate-900 dark:text-white">
        <Callout intent="primary" title="在此处编辑 JSON 将会实时更新表单" />
        <Callout
          title={'JSON 验证：' + (jsonError || '通过')}
          intent={jsonError ? 'warning' : 'success'}
        />
        <textarea
          data-use-native-undo
          className="p-1 flex-grow bg-white border text-xm font-mono resize-none focus:outline focus:outline-2 focus:outline-purple-300 dark:bg-slate-900 dark:text-white"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            handleChange(e.target.value)
          }}
        />
      </div>
    </DrawerLayout>
  )
})
SourceEditor.displayName = 'SourceEditor'

interface SourceEditorButtonProps extends ButtonProps {
  className?: string
}

export const SourceEditorButton: FC<SourceEditorButtonProps> = memo(
  ({ className, ...buttonProps }) => {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
      <>
        <Button
          className={className}
          icon="manually-entered-data"
          text="编辑 JSON"
          {...buttonProps}
          onClick={() => {
            setDrawerOpen(true)
          }}
        />
        <Drawer
          className="max-w-[800px]"
          size={DrawerSize.LARGE}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {drawerOpen && <SourceEditor />}
        </Drawer>
      </>
    )
  },
)
SourceEditorButton.displayName = 'SourceEditorButton'
