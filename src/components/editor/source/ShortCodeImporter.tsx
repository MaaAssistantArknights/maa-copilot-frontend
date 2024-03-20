import { Button, Dialog, InputGroup, MenuItem } from '@blueprintjs/core'

import { getOperation } from 'apis/operation'
import { FC, useState } from 'react'
import { useController, useForm } from 'react-hook-form'

import { INVALID_OPERATION_CONTENT } from 'models/converter'

import { parseShortCode } from '../../../models/shortCode'
import { formatError } from '../../../utils/error'
import { FormField2 } from '../../FormField'

interface ShortCodeForm {
  code: string
}

export const ShortCodeImporter: FC<{
  onImport: (content: string) => void
}> = ({ onImport }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<ShortCodeForm>()

  const {
    field: { value, onChange },
  } = useController({
    control,
    name: 'code',
    rules: {
      required: '请输入神秘代码',
    },
  })

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      setPending(true)

      const id = +(parseShortCode(code) || NaN)

      if (!isNaN(id)) {
        throw new Error('无效的神秘代码')
      }

      const operationContent = (await getOperation({ id })).parsedContent

      if (operationContent === INVALID_OPERATION_CONTENT) {
        throw new Error('无法解析作业内容')
      }

      // deal with race condition
      if (!dialogOpen) {
        return
      }

      const prettifiedJson = JSON.stringify(operationContent, null, 2)

      onImport(prettifiedJson)
      setDialogOpen(false)
    } catch (e) {
      console.warn(e)
      setError('code', { message: '加载失败：' + formatError(e) })
    } finally {
      setPending(false)
    }
  })

  return (
    <>
      <MenuItem
        icon="backlink"
        text="导入神秘代码..."
        shouldDismissPopover={false}
        onClick={() => setDialogOpen(true)}
      />
      <Dialog
        className="w-full max-w-xl"
        isOpen={dialogOpen}
        title="导入神秘代码"
        icon="backlink"
        onClose={() => {
          setPending(false)
          setDialogOpen(false)
        }}
      >
        <form className="flex flex-col px-4 pt-4" onSubmit={onSubmit}>
          <FormField2
            field="code"
            label="神秘代码"
            description="神秘代码可在本站的作业详情中获取"
            error={errors.code}
          >
            <InputGroup
              large
              placeholder="maa://..."
              value={value || ''}
              onChange={onChange}
            />
          </FormField2>

          <Button
            disabled={!isValid && !isDirty}
            intent="primary"
            loading={pending}
            type="submit"
            icon="import"
            large
          >
            导入
          </Button>
        </form>
      </Dialog>
    </>
  )
}
