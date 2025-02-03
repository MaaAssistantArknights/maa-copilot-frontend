import { AppToaster } from 'components/Toaster'

import { CopilotDocV1 } from '../models/copilot.schema'
import { ShortCodeContent, toShortCode } from '../models/shortCode'
import { formatError } from '../utils/error'
import { snakeCaseKeysUnicode } from '../utils/object'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
import { OpRatingType } from 'models/operation'
import { rateOperation } from 'apis/operation'
import { mutate } from 'swr'

export const handleDownloadJSON = (operationDoc: CopilotDocV1.Operation) => {
  // pretty print the JSON
  const json = JSON.stringify(
    // 类型对不上 https://github.com/bendrucker/snakecase-keys/issues/138
    snakeCaseKeysUnicode(operationDoc as any),
    null,
    2,
  )
  const blob = new Blob([json], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `MAACopilot_${operationDoc.doc.title}.json`
  link.click()
  URL.revokeObjectURL(url)

  AppToaster.show({
    message: '已下载作业 JSON 文件，前往 MAA 选择即可使用~',
    intent: 'success',
  })
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

export const handleRating = async (decision: OpRatingType, operationId: number) => {
  const getMessage = (decision: OpRatingType): string => {
    switch (decision) {
      case OpRatingType.None:
        return '已取消评价~';
      case OpRatingType.Like:
        return '已点赞~';
      case OpRatingType.Dislike:
        return '已点踩~';
      default:
        return '未知评价';
    }
  };
  const message = getMessage(decision);
  AppToaster.show({
    message: message,
    intent: 'success',
  })
  wrapErrorMessage(
    (e) => `提交评分失败：${formatError(e)}`,
    mutate(async (val) => {
      await rateOperation({
        id: operationId,
        rating: decision,
      })
      return val
    }),
  ).catch(console.warn)
}
