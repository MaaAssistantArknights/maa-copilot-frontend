import { Button, Icon, Menu, MenuItem } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { FC } from 'react'

import { AppToaster } from '../../Toaster'

interface SourceEditorHeaderProps {
  text: string
  onChange: (text: string) => void
}

export const SourceEditorHeader: FC<SourceEditorHeaderProps> = ({
  text,
  onChange,
}) => {
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
        content={
          <Menu>
            <MenuItem disabled icon="document-open" text="导入本地文件..." />
            <MenuItem disabled icon="backlink" text="导入神秘代码..." />
          </Menu>
        }
      >
        <Button
          className="mr-4"
          icon="import"
          text="导入"
          rightIcon="caret-down"
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
