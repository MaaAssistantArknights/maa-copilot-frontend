import { isString } from '@sentry/utils'

import ajvLocalizeZh from 'ajv-i18n/localize/zh'
import { isObject } from 'lodash-es'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { copilotSchemaValidator } from '../../models/copilot.schema.validator'
import { matchLevelByStageName } from '../../models/level'
import { Level } from '../../models/operation'
import { formatError } from '../../utils/error'
import { AppToaster } from '../Toaster'

export async function parseOperationFile(file: File): Promise<object> {
  if (file.type !== 'application/json') {
    throw new Error('请选择 JSON 文件')
  }

  try {
    const fileText = await file.text()

    const json = JSON.parse(fileText)

    if (!isObject(json)) {
      throw new Error('不是有效的对象')
    }

    return json
  } catch (e) {
    throw new Error('请选择合法的 JSON 文件：JSON 解析失败：' + formatError(e))
  }
}

export function patchOperation(operation: object, levels: Level[]): object {
  try {
    // this part is quite dirty, do not use in other parts
    // backend compatibility of minimum_required
    if (
      !operation['minimum_required'] ||
      operation['minimum_required'] === 'v4.0'
    ) {
      operation['minimum_required'] = 'v4.0.0'
    }

    if (!operation['doc']) {
      operation['doc'] = {}
    }

    const stage_name = operation['stage_name']

    if (stage_name && isString(stage_name)) {
      // title
      if (
        !isString(operation['doc']['title']) ||
        operation['doc']['title'] === ''
      ) {
        operation['doc']['title'] = stage_name
      }

      // description
      if (
        !isString(operation['doc']['details']) ||
        operation['doc']['details'] === ''
      ) {
        operation['doc']['details'] = `作业 ${stage_name}`
      }

      // i18n compatibility of level id
      if (
        !stage_name.match('^[a-z/_0-9-]*$') ||
        stage_name.indexOf('/') === -1
      ) {
        const matchStages = levels.filter((level) =>
          matchLevelByStageName(level, stage_name),
        )
        if (matchStages.length === 1) {
          operation['stage_name'] = matchStages[0].stageId
        } else {
          const reason =
            matchStages.length > 0 ? '匹配到的关卡不唯一' : '未找到对应关卡'
          throw new Error(`${reason} (${stage_name})`)
        }
      }
    }
  } catch (e) {
    console.warn(e)
    AppToaster.show({
      message: '自动修正失败：' + formatError(e),
      intent: 'warning',
    })
  }

  // i18n compatibility of char id
  // pending for now
  return operation
}

export function validateOperation(
  operation: object,
): asserts operation is CopilotDocV1.OperationSnakeCased {
  try {
    const jsonSchemaValidation = copilotSchemaValidator.validate(
      'copilot',
      operation,
    )

    if (!jsonSchemaValidation && copilotSchemaValidator.errors) {
      console.log(
        '[Copilot validation] error:',
        copilotSchemaValidator.errors,
        operation,
      )
      ajvLocalizeZh(copilotSchemaValidator.errors)
      throw new Error(
        copilotSchemaValidator.errorsText(copilotSchemaValidator.errors),
      )
    }
  } catch (e) {
    throw new Error('验证失败：' + formatError(e))
  }
}
