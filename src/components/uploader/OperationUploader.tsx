import {
  AnchorButton,
  Callout,
  FileInput,
  FormGroup,
  H4,
  Icon,
  Tag,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { useLevels } from 'apis/arknights'
import { requestOperationUpload } from 'apis/copilotOperation'
import { ComponentType, useState } from 'react'

import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { OperationDrawer } from 'components/drawer/OperationDrawer'

import { CopilotDocV1 } from '../../models/copilot.schema'
import { formatError } from '../../utils/error'
import { parseOperationFile, patchOperation, validateOperation } from './utils'

interface FileEntry {
  file: File
  error?: string
  operation?: CopilotDocV1.OperationSnakeCased
  uploaded?: boolean
}

export const OperationUploader: ComponentType = withSuspensable(() => {
  const [files, setFiles] = useState(null as FileEntry[] | null)
  const [globalErrors, setGlobalErrors] = useState(null as string[] | null)
  const [isUploading, setIsUploading] = useState(false)

  const nonUploadableReason = Object.entries({
    ['正在上传，请等待']: isUploading,
    ['存在错误，请排查问题']: globalErrors?.length,
    ['请选择文件']: !files?.length,
    ['文件列表中包含已上传的文件，请重新选择']: files?.some(
      (file) => file.uploaded,
    ),
    ['文件存在错误，请修复']: files?.some((file) => file.error),
  }).find(([, value]) => value)?.[0]

  const isUploadable = !nonUploadableReason

  const { data: levelsData, error: levelError } = useLevels()
  const levels = levelsData?.data

  // make eslint happy: we got Suspense out there
  if (!levels) return null

  if (levelError) {
    setGlobalErrors([levelError.message])
  }

  const handleFileUpload = async (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalErrors(null)

    if (event.currentTarget.files?.length) {
      const toFileEntry = async (file: File): Promise<FileEntry> => {
        const entry: FileEntry = { file }
        let content: object

        try {
          content = await parseOperationFile(file)
          content = patchOperation(content, levels)

          validateOperation(content)

          entry.operation = content
        } catch (e) {
          entry.error = formatError(e)
          console.warn(e)
        }

        return entry
      }

      setFiles(
        await Promise.all(
          Array.from(event.currentTarget.files).map(toFileEntry),
        ),
      )
    } else {
      setFiles(null)
    }
  }

  const handleOperationSubmit = async () => {
    if (!isUploadable || !files?.length) {
      return
    }

    setIsUploading(true)
    try {
      await Promise.allSettled(
        files.map((file) =>
          requestOperationUpload(JSON.stringify(file.operation))
            .then(() => (file.uploaded = true))
            .catch((e) => {
              console.warn(e)
              file.error = `上传失败：${formatError(e)}`
            }),
        ),
      )

      const successCount = files.filter((file) => !file.error).length
      const errorCount = files.length - successCount

      AppToaster.show({
        intent: 'success',
        message: `作业上传完成：成功 ${successCount} 个，失败 ${errorCount} 个`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="cloud-upload" />
          <span className="ml-2 mr-4">上传本地作业</span>
        </>
      }
    >
      <div className="h-full overflow-auto py-4 px-8 pt-8 mr-0.5 leading-relaxed">
        <H4>上传本地作业</H4>

        <p>
          若需要在上传前进行编辑，请在作业编辑器的
          <Tag minimal className="mx-1">
            编辑 JSON
          </Tag>
          处导入作业
        </p>

        <FormGroup
          className="mt-4"
          label={<span className="font-bold">选择作业文件</span>}
          labelFor="file-input"
          labelInfo="仅支持 .json 文件，可多选"
        >
          <FileInput
            large
            fill
            buttonText="浏览"
            text={files?.length ? `${files.length} 个文件` : '选择文件...'}
            inputProps={{
              accept: '.json',
              multiple: true,
            }}
            onInputChange={handleFileUpload}
          />
        </FormGroup>

        <Tooltip2
          fill
          className="mt-4"
          placement="top"
          content={nonUploadableReason}
        >
          {/* do not use <Button> because its disabled state does not work well with Tooltip */}
          <AnchorButton
            large
            fill
            disabled={!isUploadable}
            loading={isUploading}
            icon="cloud-upload"
            onClick={handleOperationSubmit}
          >
            上传
          </AnchorButton>
        </Tooltip2>

        {globalErrors && (
          <Callout className="mt-4" intent="danger" icon="error" title="错误">
            {globalErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </Callout>
        )}

        {!!files?.length && <div className="mt-4 font-bold">文件详情</div>}
        {files?.map(({ file, uploaded, error, operation }, index) => (
          <Callout
            className="mt-2"
            title={file.name}
            key={index}
            intent={uploaded ? 'success' : error ? 'danger' : 'none'}
            icon={
              !uploaded && !error
                ? 'document'
                : undefined /* use default icons */
            }
          >
            <p className="text-black/60">
              {operation ? operation.doc.title || '无标题' : null}
            </p>
            {error && <p className="text-red-500">{error}</p>}
          </Callout>
        ))}
      </div>
    </OperationDrawer>
  )
})
