import { AppToaster } from 'components/Toaster'

import { CopilotDocV1 } from '../models/copilot.schema'
import { ShortCodeContent, toShortCode } from '../models/shortCode'
import { formatError } from '../utils/error'
import { OperationApi } from '../utils/maa-copilot-client'
import { snakeCaseKeysUnicode } from '../utils/object'

const doTriggerDownloadJSON = (content: string, filename: string) => {
  const blob = new Blob([content], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const handleDownloadJSON = (operationDoc: CopilotDocV1.Operation) => {
  // pretty print the JSON
  const json = JSON.stringify(
    // 类型对不上 https://github.com/bendrucker/snakecase-keys/issues/138
    snakeCaseKeysUnicode(operationDoc as any),
    null,
    2,
  )

  doTriggerDownloadJSON(json, `MAACopilot_${operationDoc.doc.title}.json`)

  AppToaster.show({
    message: '已下载作业 JSON 文件，前往 MAA 选择即可使用~',
    intent: 'success',
  })
}

export const handleLazyDownloadJSON = async (id: number, title: string) => {
  const resp = await new OperationApi().getCopilotById({
    id: id,
  })
  const json = JSON.stringify(
    snakeCaseKeysUnicode(JSON.parse(resp.data?.content ?? '{}') as any),
    null,
    2,
  )
  doTriggerDownloadJSON(json, `MAACopilot_${title}.json`)
}

/**
 * @param target - Either an operation or an operation set
 */
export const copyShortCode = async (target: { id: number }) => {
  try {
    const content: ShortCodeContent = {
      id: target.id,
    }

    const shortCode = toShortCode(content)
    navigator.clipboard.writeText(shortCode)

    AppToaster.show({
      message: '已复制神秘代码，前往 MAA 粘贴即可使用~',
      intent: 'success',
    })
  } catch (e) {
    AppToaster.show({
      message: '复制神秘代码失败：' + formatError(e),
      intent: 'danger',
    })
  }
}
