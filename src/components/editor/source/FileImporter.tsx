import { MenuItem } from '@blueprintjs/core'

import { ChangeEventHandler, FC, useRef } from 'react'

import { AppToaster } from '../../Toaster'

export const FileImporter: FC<{ onImport: (content: string) => void }> = ({
  onImport,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    try {
      onImport(await file.text())
    } catch (e) {
      console.warn('Failed to read file:', e)
      AppToaster.show({
        message: '无法读取文件',
        intent: 'danger',
      })
    }
  }

  return (
    <>
      <MenuItem
        icon="document-open"
        shouldDismissPopover={false}
        onClick={() => inputRef.current?.click()}
        text={
          <>
            导入本地文件...
            <input
              className="hidden"
              type="file"
              accept="application/json"
              ref={inputRef}
              onChange={handleUpload}
            />
          </>
        }
      />
    </>
  )
}
