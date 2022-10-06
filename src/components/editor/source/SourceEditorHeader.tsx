import { Button, Icon, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { FC, useState } from 'react'

import { AppToaster } from '../../Toaster'
import { FileImporter } from './FileImporter'
import { ShortCodeImporter } from './ShortCodeImporter'

interface SourceEditorHeaderProps {
  text: string
  onChange: (text: string) => void
}

export const SourceEditorHeader: FC<SourceEditorHeaderProps> = ({
  text,
  onChange,
}) => {
  const [importDropdownOpen, setImportDropdownOpen] = useState(false)

  const handleImport = (text: string) => {
    setImportDropdownOpen(false)
    onChange(text)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)

    AppToaster.show({
      message: '已复制 JSON 到剪贴板',
      intent: 'success',
    })
  }

  const handleDownload = () => {
    const blob = new Blob([text], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `MAACopilot_作业.json`
    link.click()
    URL.revokeObjectURL(url)

    AppToaster.show({
      message: '已下载作业 JSON 文件',
      intent: 'success',
    })
  }

  return (
    <>
      <Icon icon="manually-entered-data" />
      <span className="ml-2">编辑 JSON</span>

      <div className="flex-1" />

      <Popover2
        minimal
        position="bottom-left"
        isOpen={importDropdownOpen}
        onClose={() => setImportDropdownOpen(false)}
        content={
          <Menu>
            <FileImporter onImport={handleImport} />
            <ShortCodeImporter onImport={handleImport} />
          </Menu>
        }
      >
        <Button
          className="mr-4"
          icon="import"
          text="导入"
          rightIcon="caret-down"
          onClick={() => setImportDropdownOpen(!importDropdownOpen)}
        />
      </Popover2>

      <Popover2
        minimal
        position="bottom-left"
        content={
          <Menu>
            <MenuItem icon="clipboard" text="复制" onClick={handleCopy} />
            <MenuItem icon="download" text="下载" onClick={handleDownload} />
          </Menu>
        }
      >
        <Button
          className="mr-4"
          icon="export"
          text="导出..."
          rightIcon="caret-down"
        />
      </Popover2>
    </>
  )
}
