import {
  Button,
  ButtonProps,
  Callout,
  Drawer,
  DrawerSize,
  H6,
  IconSize,
  Spinner,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { debounce } from 'lodash-es'
import { FC, memo, useMemo, useRef, useState } from 'react'
import { ZodError } from 'zod'

import { formatError } from '../../../utils/error'
import { Confirm } from '../../Confirm'
import { withSuspensable } from '../../Suspensable'
import { DrawerLayout } from '../../drawer/DrawerLayout'
import { SourceEditorHeader } from '../../editor/source/SourceEditorHeader'
import { editorAtoms, useEdit } from '../editor-state'
import { toEditorOperation, toMaaOperation } from '../reconciliation'
import { ZodIssue, operationLooseSchema } from '../validation/schema'

interface SourceEditorProps {
  onUnsavedChanges?: (hasUnsavedChanges: boolean) => void
}

const SourceEditor = withSuspensable(
  ({ onUnsavedChanges }: SourceEditorProps) => {
    const onUnsavedChangesRef = useRef(onUnsavedChanges)
    onUnsavedChangesRef.current = onUnsavedChanges
    const edit = useEdit()
    const [operation, setOperation] = useAtom(editorAtoms.operation)
    const [text, setText] = useState(() =>
      JSON.stringify(toMaaOperation(operation), null, 2),
    )
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [pending, setPending] = useState(false)
    const [errors, setErrors] = useState<(ZodIssue | string)[]>([])

    const update = useMemo(
      () =>
        debounce((text: string) => {
          setPending(false)
          try {
            const json = operationLooseSchema.parse(JSON.parse(text))
            edit((get, set, skip) => {
              const newOperation = toEditorOperation(json)
              const operation = get(editorAtoms.operation)
              if (JSON.stringify(operation) === JSON.stringify(newOperation)) {
                return skip
              }
              setOperation(newOperation)
              return {
                action: 'edit-json',
                desc: '编辑 JSON',
                squash: true,
              }
            })

            setErrors([])
            setHasUnsavedChanges(false)
            onUnsavedChangesRef.current?.(false)
          } catch (e) {
            if (e instanceof SyntaxError) {
              setErrors(['JSON 语法错误'])
            } else if (e instanceof ZodError) {
              setErrors(e.issues)
            } else {
              setErrors(['未知错误: ' + formatError(e)])
            }
          }
        }, 1000),
      [edit, setOperation],
    )

    const handleChange = (text: string) => {
      setPending(true)
      setText(text)
      update(text)
      setHasUnsavedChanges(true)
      onUnsavedChanges?.(true)
    }

    return (
      <DrawerLayout
        title={<SourceEditorHeader text={text} onChange={handleChange} />}
      >
        <div className="px-8 py-4 flex-grow flex flex-col gap-2 bg-zinc-50 dark:bg-slate-900 dark:text-white">
          <Callout
            title="编辑后的 JSON 内容会自动同步到编辑器里"
            intent={hasUnsavedChanges ? 'primary' : 'success'}
            icon={
              pending ? (
                <Spinner size={IconSize.STANDARD} className="bp4-icon" />
              ) : hasUnsavedChanges ? (
                'warning-sign'
              ) : (
                'tick'
              )
            }
          />
          <Callout
            title={errors.length ? '存在错误' : '验证通过'}
            intent={errors.length ? 'danger' : 'success'}
          >
            {errors.length > 0 ? (
              <details open>
                <summary className="cursor-pointer">
                  {errors.length} 个错误
                </summary>
                <ul className="">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {typeof error === 'string' ? (
                        error
                      ) : (
                        <>
                          {' '}
                          <span className="font-bold">
                            {error.path.join('.')}:{' '}
                          </span>
                          {error.message}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </Callout>
          <textarea
            className="p-1 flex-grow bg-white border text-xm font-mono resize-none focus:outline focus:outline-2 focus:outline-purple-300 dark:bg-slate-900 dark:text-white"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => update.flush()}
          />
        </div>
      </DrawerLayout>
    )
  },
)
SourceEditor.displayName = 'SourceEditor'

interface SourceEditorButtonProps extends ButtonProps {
  className?: string
}

export const SourceEditorButton: FC<SourceEditorButtonProps> = memo(
  ({ className, ...buttonProps }) => {
    const [isOpen, setIsOpen] = useAtom(editorAtoms.sourceEditorIsOpen)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    return (
      <>
        <Button
          className={className}
          icon="manually-entered-data"
          text="编辑 JSON"
          {...buttonProps}
          onClick={() => setIsOpen(true)}
        />
        <Confirm
          intent="danger"
          confirmButtonText="关闭"
          onConfirm={() => setIsOpen(false)}
          trigger={({ handleClick }) => (
            <Drawer
              className="max-w-[800px]"
              size={DrawerSize.LARGE}
              isOpen={isOpen}
              onClose={() => {
                if (hasUnsavedChanges) {
                  handleClick()
                } else {
                  setIsOpen(false)
                }
              }}
            >
              {isOpen && (
                <SourceEditor onUnsavedChanges={setHasUnsavedChanges} />
              )}
            </Drawer>
          )}
        >
          <H6>操作未保存</H6>
          <p>未保存的操作将在关闭 JSON 编辑器后丢失，是否仍要关闭？</p>
        </Confirm>
      </>
    )
  },
)
SourceEditorButton.displayName = 'SourceEditorButton'
