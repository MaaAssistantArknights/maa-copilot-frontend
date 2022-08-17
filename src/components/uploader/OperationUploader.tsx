import {
  Button,
  Callout,
  FileInput,
  FormGroup,
  H4,
  Icon,
} from '@blueprintjs/core'
import { requestCopilotUpload } from 'apis/copilotOperation'
import { OperationDrawer } from 'components/drawer/OperationDrawer'
import { AppToaster } from 'components/Toaster'
import { STAGES } from 'models/generated/stages'
import { FC, useState } from 'react'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
// TODO: json schema validation
// ajv can work properly with http://json-schema.org/draft-07/schema
// and copilot backend server need to use draft-6

const operationPatch = (operation: object): object => {
  // this part is quite dirty, do not use in other parts
  // backend compatibility of minimum_required
  if (
    !operation['minimum_required'] ||
    operation['minimum_required'] === 'v4.0'
  ) {
    operation['minimum_required'] = 'v4.0.0'
  }

  if (!operation['doc']) {
    operation['doc'] = operation['doc'] ?? {}

    // title
    if (!operation['doc']['title']) {
      operation['doc']['title'] = operation['stage_name']
    }

    // description
    if (!operation['doc']['details']) {
      operation['doc']['details'] = `作业 ${operation['stage_name']}`
    }
  }

  // i18n compatibility of level id
  if (
    !(operation['stage_name'] as string).match('^[a-z/_0-9-]*$') ||
    (operation['stage_name'] as string).indexOf('/') === -1
  ) {
    const matchStages = STAGES.filter((stage) => {
      return (
        stage.name === operation['stage_name'] ||
        stage.code === operation['stage_name']
      )
    })
    if (matchStages.length === 1) {
      operation['stage_name'] = matchStages[0].levelId
    } else {
      AppToaster.show({
        message: `已找到 ${matchStages.length} 个关卡，跳过自动修正`,
        intent: 'warning',
      })
    }
  }

  // i18n compatibility of char id
  // pending for now
  return operation
}

export const OperationUploader: FC = () => {
  const [filename, setFilename] = useState(null as string | null)
  const [error, setErrors] = useState(null as string[] | null)
  const [operation, setOperation] = useState(null as object | null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.FormEvent<HTMLInputElement>) => {
    setErrors(null)
    setOperation(null)

    const file = event.currentTarget.files?.[0]
    if (file) {
      setFilename(file.name)
      if (file.type !== 'application/json') {
        setErrors(['请选择 JSON 文件'])
        return
      }

      const fileText = await file.text()
      let operationObject: object
      try {
        operationObject = JSON.parse(fileText)
      } catch (e) {
        const err = e as Error
        setErrors(['请选择合法的 JSON 文件：JSON 解析失败：' + err.message])
        return
      }

      // bypass jsonschema validation according to mist
      // const jsonSchemaValidation = copilotSchemaValidator.validate(
      //   'copilot',
      //   operationObject,
      // )
      // console.log(jsonSchemaValidation, copilotSchemaValidator.errors)
      const patchedOperation = operationPatch(operationObject)
      console.log('patchedOperation', patchedOperation)
      setOperation(patchedOperation)
    }
  }

  const handleOperationSubmit = async () => {
    setIsUploading(true)
    try {
      await wrapErrorMessage(
        (e: NetworkError) => `作业上传失败：${e.responseMessage}`,
        requestCopilotUpload(JSON.stringify(operation)),
      )
    } finally {
      setIsUploading(false)
    }
    AppToaster.show({
      intent: 'success',
      message: '作业上传成功',
    })
  }

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="cloud-upload" />
          <span className="ml-2 mr-4">上传已有作业</span>
        </>
      }
    >
      <div className="h-full overflow-auto py-4 px-8 pt-8 mr-0.5 leading-relaxed">
        <H4>上传已有作业</H4>

        <p>本功能仅限于上传已有的作业文件。</p>

        <p>若需要创建新的作业，还请期待作业编辑器完工。</p>

        <FormGroup
          className="mt-4"
          label={<span className="font-bold">选择作业文件</span>}
          labelFor="file-input"
          labelInfo="仅支持 .json 文件"
        >
          <FileInput
            large
            fill
            text={filename ?? '选择文件...'}
            onInputChange={handleFileUpload}
          />
        </FormGroup>

        {error && (
          <Callout className="mt-4" intent="danger" icon="error" title="错误">
            {error.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </Callout>
        )}

        <Button
          className="mt-4"
          large
          fill
          disabled={operation === null || isUploading}
          loading={isUploading}
          icon="form"
          onClick={handleOperationSubmit}
        >
          验证并上传
        </Button>
      </div>
    </OperationDrawer>
  )
}
