import { Button, Drawer, Icon } from '@blueprintjs/core'

import { FC, useMemo, useRef, useState } from 'react'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { AppToaster } from '../Toaster'
import { OperationDrawer } from '../drawer/OperationDrawer'

export const SourceViewerButton: FC<{
  className?: string
  getSource: () => Promise<CopilotDocV1.OperationSnakeCased | undefined>
}> = ({ className, getSource }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const source = useRef<CopilotDocV1.OperationSnakeCased>()

  const open = async () => {
    source.current = await getSource()

    if (source.current) {
      setDrawerOpen(true)
    }
  }

  return (
    <>
      <Button
        className={className}
        icon="document-share"
        text="查看 JSON"
        onClick={open}
      />
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {source.current && <SourceViewer source={source.current} />}
      </Drawer>
    </>
  )
}

const SourceViewer: FC<{ source: CopilotDocV1.OperationSnakeCased }> = ({
  source,
}) => {
  const text = useMemo(() => JSON.stringify(source, null, 2), [source])

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
    link.download = `MAACopilot_作业_${source.stage_name.replace(
      '/',
      '_',
    )}.json`
    link.click()
    URL.revokeObjectURL(url)

    AppToaster.show({
      message: '已下载作业 JSON 文件',
      intent: 'success',
    })
  }

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="document" />
          <span className="ml-2">查看 JSON</span>

          <div className="flex-1" />

          <Button
            className="ml-4"
            icon="clipboard"
            text="复制"
            onClick={handleCopy}
          />

          <Button
            className="ml-4"
            icon="download"
            text="下载"
            intent="primary"
            onClick={handleDownload}
          />
        </>
      }
    >
      <code className="p-8 text-xs overflow-auto">
        <pre>{text}</pre>
      </code>
    </OperationDrawer>
  )
}
