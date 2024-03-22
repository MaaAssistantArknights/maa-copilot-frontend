import {
  Button,
  ButtonProps,
  Callout,
  Checkbox,
  Dialog,
  NonIdealState,
} from '@blueprintjs/core'

import {
  addToOperationSet,
  removeFromOperationSet,
  useOperationSets,
} from 'apis/operation-set'
import clsx from 'clsx'
import { useState } from 'react'

import { AppToaster } from 'components/Toaster'
import { OperationSetEditorDialog } from 'components/operation-set/OperationSetEditor'
import { formatError } from 'utils/error'
import { useNetworkState } from 'utils/useNetworkState'

interface AddToOperationSetButtonProps extends ButtonProps {
  operationId: number
}

export function AddToOperationSetButton({
  operationId,
  ...props
}: AddToOperationSetButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        {...props}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
      />
      <Dialog
        title="添加到作业集"
        icon="user"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <AddToOperationSet
          operationId={operationId}
          isOpen={isOpen}
          onSuccess={() => setIsOpen(false)}
        />
      </Dialog>
    </>
  )
}

interface AddToOperationSetProps {
  operationId: number
  isOpen: boolean
  onSuccess: () => void
}

export function AddToOperationSet({
  operationId,
  onSuccess,
}: AddToOperationSetProps) {
  const {
    operationSets,
    refresh,
    error: listError,
  } = useOperationSets({
    byMyself: true,
  })

  const {
    networkState: { loading, error: submitError },
    start,
    finish,
  } = useNetworkState()

  const [editorOpen, setEditorOpen] = useState(false)
  const [onlyShowAdded, setOnlyShowAdded] = useState(false)
  const [checkboxOverrides, setCheckboxOverrides] = useState(
    {} as Record<number, boolean>,
  )

  const error = submitError || listError

  const operationSetList = onlyShowAdded
    ? operationSets?.filter(
        (set) =>
          checkboxOverrides[set.id] ?? set.copilotIds.includes(operationId),
      )
    : operationSets

  const alreadyAdded = (operationSetId: number) =>
    !!operationSets?.find(
      (set) =>
        set.id === operationSetId && set.copilotIds.includes(operationId),
    )

  const onSubmit = async () => {
    if (loading || !operationSets?.length) return

    start()

    try {
      const tasks = Object.entries(checkboxOverrides).map(
        ([idKey, checked]) => {
          const id = +idKey
          if (isNaN(id)) return undefined

          if (checked && !alreadyAdded(id)) {
            return addToOperationSet({
              operationSetId: id,
              operationIds: [operationId],
            })
          } else if (!checked && alreadyAdded(id)) {
            return removeFromOperationSet({
              operationSetId: id,
              operationIds: [operationId],
            })
          }

          return undefined
        },
      )

      if (tasks.find(Boolean)) {
        await Promise.all(tasks)

        AppToaster.show({
          intent: 'success',
          message: '已添加到作业集',
        })
      }

      finish(null)
      onSuccess()
    } catch (e) {
      finish(e as Error)
    }
  }

  return (
    <>
      <div className="py-2">
        {error && (
          <Callout intent="danger" icon="error" title="错误">
            {formatError(error)}
          </Callout>
        )}

        {operationSetList?.length === 0 && (
          <NonIdealState
            icon="helicopter"
            description={
              operationSets?.length === 0
                ? '还没有作业集哦(￣▽￣)'
                : '还没有已添加的作业集哦(￣▽￣)'
            }
          />
        )}

        <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
          {operationSetList?.map(({ id, name, copilotIds }) => (
            <div key={id}>
              <Checkbox
                large
                className={clsx(
                  'block m-0 p-2 !pl-10 hover:bg-slate-200',
                  checkboxOverrides[id] !== undefined &&
                    checkboxOverrides[id] !== alreadyAdded(id) &&
                    'font-bold',
                )}
                label={name}
                checked={
                  checkboxOverrides[id] ?? copilotIds.includes(operationId)
                }
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked
                  setCheckboxOverrides((prev) => ({ ...prev, [id]: checked }))
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      <div className="flex space-x-3 p-4">
        <Checkbox
          label="只显示已添加的"
          className="grow"
          checked={onlyShowAdded}
          onChange={(e) =>
            setOnlyShowAdded((e.target as HTMLInputElement).checked)
          }
        />
        <Button onClick={() => setEditorOpen(true)}>创建作业集...</Button>
        <Button
          disabled={!operationSets?.length}
          loading={loading}
          intent="primary"
          onClick={onSubmit}
        >
          确定
        </Button>
      </div>

      <OperationSetEditorDialog
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          refresh()
        }}
      />
    </>
  )
}
