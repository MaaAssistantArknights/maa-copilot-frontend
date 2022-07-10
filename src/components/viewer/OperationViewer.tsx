import {
  Button,
  ButtonGroup,
  H3,
  H4,
  Icon,
  IconSize,
  Tag,
} from '@blueprintjs/core'
import { useAtom } from 'jotai'
import { merge } from 'lodash-es'
import { Operation, Response } from 'models/operation'
import { ComponentType } from 'react'
import Rating from 'react-rating'
import { FactItem } from 'src/components/FactItem'
import { RelativeTime } from 'src/components/RelativeTime'
import { authAtom } from 'store/auth'
import { useOperation } from '../../apis/query'
import { apiPostRating } from '../../apis/rating'
import { OpRating } from '../../models/operation'
import { OperationDrawer } from '../drawer/OperationDrawer'
import { Paragraphs } from '../Paragraphs'
import { withSuspensable } from '../Suspensable'
import { AppToaster } from '../Toaster'

export const OperationViewer: ComponentType<{
  operationId: string
}> = withSuspensable(({ operationId }) => {
  const { data, mutate } = useOperation(operationId)
  const operation = data?.data

  const [auth] = useAtom(authAtom)
  const authed = !!auth.token

  // make eslint happy: we got Suspense out there
  if (!operation) return null

  const handleCopyShortCode = () => {
    if (!operation?.id) {
      AppToaster.show({
        message: '获取作业失败',
        intent: 'danger',
      })
      return
    }

    const shortCode = `maa://${operation.id}`
    navigator.clipboard.writeText(shortCode)

    AppToaster.show({
      message: '已复制神秘代码，前往 MAA 粘贴即可使用！',
      intent: 'success',
    })
  }

  const handleDownloadJSON = () => {
    const content = operation?.content
    if (!content) {
      AppToaster.show({
        message: '获取作业失败',
        intent: 'danger',
      })
      return
    }

    const blob = new Blob([JSON.stringify(content)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `MAACopilot_作业${operation.id}.json`
    link.click()
    URL.revokeObjectURL(url)

    AppToaster.show({
      message: '已下载作业 JSON 文件，前往 MAA 选择即可使用！',
      intent: 'success',
    })
  }

  const handleRating = async (decision: OpRating) => {
    const optimisticData: Response<Operation> = merge(data, {
      data: { ...operation, ratingType: decision },
    })

    console.log('optimisticData', optimisticData)

    mutate(
      async (val) => {
        const { data } = await apiPostRating(operationId, decision)
        const { rating, ...restData } = data

        return merge(val, {
          data: {
            ...restData,
            ratingType: rating,
          },
        })
      },
      { optimisticData, rollbackOnError: true },
    )
  }

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="document" />
          <span className="ml-2">MAA Copilot 作业</span>

          <div className="flex-1"></div>

          <Button
            className="ml-4"
            icon="download"
            text="下载原 JSON"
            onClick={handleDownloadJSON}
          />

          <Button
            className="ml-4"
            icon="clipboard"
            text="复制神秘代码"
            intent="primary"
            onClick={handleCopyShortCode}
          />
        </>
      }
    >
      <div className="h-full overflow-auto py-4 px-8 pt-8">
        <H3>{operation?.title}</H3>

        <div className="grid grid-rows-1 grid-cols-3 gap-8">
          <div className="flex flex-col">
            <Paragraphs content={operation?.detail} />
          </div>

          <div className="flex flex-col">
            <FactItem title="作战">
              <Tag
                className="bg-slate-100 text-slate-900 border border-slate-300 border-solid"
                large
              >
                {operation?.stageName}
              </Tag>
            </FactItem>

            <FactItem title="作业评分">
              <Rating
                className="mr-2"
                initialRating={(operation?.ratingRatio || 0) * 5}
                fullSymbol={
                  <Icon
                    size={IconSize.LARGE}
                    icon="star"
                    className="text-yellow-500"
                  />
                }
                placeholderSymbol={
                  <Icon
                    size={IconSize.LARGE}
                    icon="star"
                    className="text-yellow-500"
                  />
                }
                emptySymbol={
                  <Icon
                    size={IconSize.LARGE}
                    icon="star-empty"
                    className="text-zinc-600"
                  />
                }
                readonly
              />

              {/* only show like or dislike if the user is authed. otherwise, hide it */}
              {authed && (
                <ButtonGroup className="flex items-center ml-2">
                  <Button
                    icon="thumbs-up"
                    intent={
                      operation?.ratingType === OpRating.Like
                        ? 'success'
                        : 'none'
                    }
                    className="mr-2"
                    active={operation?.ratingType === OpRating.Like}
                    onClick={() => handleRating(OpRating.Like)}
                  />
                  <Button
                    icon="thumbs-down"
                    intent={
                      operation?.ratingType === OpRating.Dislike
                        ? 'danger'
                        : 'none'
                    }
                    active={operation?.ratingType === OpRating.Dislike}
                    onClick={() => handleRating(OpRating.Dislike)}
                  />
                </ButtonGroup>
              )}
            </FactItem>
          </div>

          <div className="flex flex-col items-start select-none tabular-nums">
            <FactItem title="浏览量" icon="eye-open">
              <span className="text-gray-800 font-bold">{operation.views}</span>
            </FactItem>

            <FactItem title="发布于" icon="time">
              <span className="text-gray-800 font-bold">
                <RelativeTime moment={operation.uploadTime} />
              </span>
            </FactItem>

            <FactItem title="上传者" icon="user">
              <span className="text-gray-800 font-bold">
                {operation.uploader}
              </span>
            </FactItem>
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6"></div>

        <div className="grid grid-rows-1 grid-cols-3 h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)] gap-8">
          <div className="flex flex-col">
            <H4 className="mb-4">干员与干员组</H4>
            {JSON.stringify(operation?.operators, null, 2)}
            {JSON.stringify(operation?.groups, null, 2)}
          </div>

          <div className="col-span-2">
            <H4 className="mb-4">动作序列</H4>
            {JSON.stringify(operation, null, 2)}
          </div>
        </div>
      </div>
    </OperationDrawer>
  )
})
