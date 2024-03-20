import {
  AnchorButton,
  Callout,
  FileInput,
  FormGroup,
  H4,
  Icon,
  Spinner,
  SpinnerSize,
  Tag,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { useLevels } from 'apis/level'
import { createOperation } from 'apis/operation'
import { ComponentType, useState } from 'react'
import { useList } from 'react-use'

import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { DrawerLayout } from 'components/drawer/DrawerLayout'

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
  const [files, { set: setFiles, update: updateFileWhere }] =
    useList<FileEntry>([])

  const [globalErrors, setGlobalErrors] = useState(null as string[] | null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // reasons are in the order of keys
  const nonUploadableReason = Object.entries({
    ['正在上传，请等待']: isUploading,
    ['正在解析文件，请等待']: isProcessing,
    ['请选择文件']: !files.length,
    ['文件列表中包含已上传的文件，请重新选择']: files.some(
      (file) => file.uploaded,
    ),
    ['文件存在错误，请修改内容']: files.some((file) => file.error),
    ['存在错误，请排查问题']: globalErrors?.length,
  }).find(([, value]) => value)?.[0]

  const isUploadable = !nonUploadableReason

  const { data: levels, error: levelError } = useLevels({ suspense: true })

  if (levelError) {
    setGlobalErrors([levelError.message])
  }

  const handleFileSelect = async (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalErrors(null)

    if (event.currentTarget.files?.length) {
      setIsProcessing(true)

      const toFileEntry = async (file: File): Promise<FileEntry> => {
        const entry: FileEntry = { file }

        try {
          let content = await parseOperationFile(file)
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
        await Promise.all(Array.from(event.currentTarget.files, toFileEntry)),
      )

      setIsProcessing(false)
    } else {
      setFiles([])
    }
  }

  const handleOperationSubmit = async () => {
    if (!isUploadable || !files.length) {
      return
    }

    setIsUploading(true)
    try {
      let successCount = 0

      await Promise.allSettled(
        files.map((file) =>
          createOperation({ content: JSON.stringify(file.operation) })
            .then(() => {
              successCount++
              updateFileWhere((candidate) => candidate === file, {
                ...file,
                uploaded: true,
              })
            })
            .catch((e) => {
              console.warn(e)
              updateFileWhere((candidate) => candidate === file, {
                ...file,
                error: `上传失败：${formatError(e)}`,
              })
            }),
        ),
      )

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
    <DrawerLayout
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
            disabled={isUploading || isProcessing}
            buttonText="浏览"
            text={files.length ? `${files.length} 个文件` : '选择文件...'}
            inputProps={{
              accept: '.json',
              multiple: true,
            }}
            onInputChange={handleFileSelect}
          />
        </FormGroup>

        <Tooltip2
          fill
          className="mt-4"
          placement="top"
          disabled={!nonUploadableReason}
          content={nonUploadableReason}
        >
          {(() => {
            const settledCount = files.filter(
              (file) => file.uploaded || file.error,
            ).length

            return (
              // do not use <Button> because its disabled state does not work well with Tooltip
              <AnchorButton
                large
                fill
                disabled={!isUploadable}
                icon={
                  isUploading ? (
                    <Spinner
                      size={SpinnerSize.SMALL}
                      value={settledCount / files.length}
                    />
                  ) : (
                    'cloud-upload'
                  )
                }
                onClick={handleOperationSubmit}
              >
                {isUploading ? `${settledCount}/${files.length}` : '上传'}
              </AnchorButton>
            )
          })()}
        </Tooltip2>

        {globalErrors && (
          <Callout className="mt-4" intent="danger" icon="error" title="错误">
            {globalErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </Callout>
        )}

        {!!files.length && <div className="mt-4 font-bold">文件详情</div>}
        {files.map(({ file, uploaded, error, operation }, index) => (
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
    </DrawerLayout>
  )
})
