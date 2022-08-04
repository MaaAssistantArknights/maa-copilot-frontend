import { H4, Callout, Icon, FileInput, Button } from '@blueprintjs/core'
import { OperationDrawer } from 'components/drawer/OperationDrawer'
import { FC, useState } from 'react'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
import { requestCopilotUpload } from 'apis/copilotOperation'
import { AppToaster } from 'components/Toaster'
import { STAGES } from 'models/generated/stages'
// TODO: json schema validation
// ajv can work properly with http://json-schema.org/draft-07/schema
// and copilot backend server need to use draft-6

// import { copilotSchemaValidator } from 'models/copilot.schema.validator'
// import type { ErrorObject } from 'ajv'

// const tryFixOperationSchemaErrors = (
//   jsonObject: object,
//   erros: ErrorObject[],
// ): object => {
//   // This is hard coded and do not gaurentee that correctness
//   for (const error of erros) {
//     if (error.instancePath === '/minimum_required') {
//       jsonObject['minimum_required'] = 'v4.0.0'
//     }
//   }
//   return jsonObject
// }

const operationPatch = (operation: object): object => {
  // this part is quite dirty, do not use in other parts

  // backend compatibility of minimum_required
  if (operation['minimum_required'] == 'v4.0') {
    operation['minimum_required'] = 'v4.0.0'
  }

  // i18n compatibility of level id
  if (!(operation['stage_name'] as string).match('^[a-z/_0-9-]$')) {
    const matchStages = STAGES.filter((stage) => {
      return (
        stage.name === operation['stage_name'] ||
        stage.code === operation['stage_name']
      )
    })
    if (matchStages.length == 1) {
      operation['stage_name'] = matchStages[0].levelId
    } else {
      AppToaster.show({
        message: `已找到${matchStages.length}个关卡，跳过自动修正`,
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
      const fileText = await file.text()
      let operationObject: object
      try {
        operationObject = JSON.parse(fileText)
      } catch (error) {
        setErrors(['请上传正确的JSON文件'])
        return
      }

      // bypass jsonschema validation according to mist
      // const jsonSchemaValidation = copilotSchemaValidator.validate(
      //   'copilot',
      //   operationObject,
      // )
      // console.log(jsonSchemaValidation, copilotSchemaValidator.errors)

      setOperation(operationPatch(operationObject))
    }
  }

  const handleOperationSubmit = async () => {
    setIsUploading(true)
    await wrapErrorMessage(
      (e: NetworkError) => `MAA作业上传失败：${e.responseMessage}`,
      requestCopilotUpload(JSON.stringify(operation)),
    )
    AppToaster.show({
      intent: 'success',
      message: 'MAA作业上传成功',
    })
    setIsUploading(false)
  }

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="document" />
          <span className="ml-2 mr-4">MAA Copilot 上传已有作业</span>
        </>
      }
    >
      <div className="h-full overflow-auto py-4 px-8 pt-8 mr-0.5">
        <H4>上传文件</H4>

        <p>本功能仅限于上传已有的MAA作业。</p>

        <p>如果您想创建新的MAA作业，请使用作业编辑器。</p>

        <FileInput
          text={filename ?? '选择文件'}
          onInputChange={handleFileUpload}
        />

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
          icon="form"
          onClick={handleOperationSubmit}
        >
          验证并上传
        </Button>
      </div>
    </OperationDrawer>
  )
}
