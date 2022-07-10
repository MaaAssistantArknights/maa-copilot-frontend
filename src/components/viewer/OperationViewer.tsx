import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  H3,
  H4,
  H5,
  Icon,
  IconSize,
  NonIdealState,
  Tag,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'
import { useAtom } from 'jotai'
import { merge } from 'lodash-es'
import { Operation, Response } from 'models/operation'
import { ComponentType, FC, useMemo } from 'react'
import Rating from 'react-rating'
import { FactItem } from 'src/components/FactItem'
import { RelativeTime } from 'src/components/RelativeTime'
import { ViewerActions } from 'src/components/viewer/ViewerActions'
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
      message: '已复制神秘代码，前往 MAA 粘贴即可使用~',
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
      message: '已下载作业 JSON 文件，前往 MAA 选择即可使用~',
      intent: 'success',
    })
  }

  const handleRating = async (decision: OpRating) => {
    const optimisticData: Response<Operation> = merge(data, {
      data: { ...operation, ratingType: decision },
    })

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

  const operationDoc = useMemo(() => {
    return JSON.parse(operation.content) as CopilotDocV1.Operation
  }, [operation])

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

            <FactItem relaxed className="items-start" title="作业评分">
              <div className="flex flex-col">
                <Rating
                  className="mr-2"
                  initialRating={operation.ratingRatio * 5}
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
                <div className="text-zinc-500">
                  {operation.ratingRatio === -1
                    ? '—'
                    : (operation.ratingRatio * 5).toFixed(1)}{' '}
                  / 5.0
                </div>
              </div>

              {/* only show like or dislike if the user is authed. otherwise, hide it */}
              {authed && (
                <ButtonGroup className="flex items-center ml-2">
                  <Tooltip2 content="o(*≧▽≦)ツ" placement="bottom">
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
                  </Tooltip2>
                  <Tooltip2 content=" ヽ(。>д<)ｐ" placement="bottom">
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
                  </Tooltip2>
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
            <H5 className="mb-4 text-slate-600">干员</H5>
            <div className="flex flex-col mb-4">
              {operation.operators.map((operator) => (
                <OperatorCard operator={operator} />
              ))}
              {operation.operators.length === 0 && (
                <EmptyOperator description="作业并未添加干员" />
              )}
            </div>

            <H5 className="mb-4 text-slate-600">干员组</H5>
            <div className="flex flex-col">
              {operation.groups.map((el) => (
                <Card elevation={Elevation.ONE} className="mb-4">
                  <div className="flex flex-col">
                    <H5 className="text-gray-800 font-bold">{el.name}</H5>

                    <div className="flex flex-col">
                      {el.operators.filter(Boolean).map((operator) => (
                        <OperatorCard operator={operator} />
                      ))}

                      {el.operators.filter(Boolean).length === 0 && (
                        <EmptyOperator description="干员组中并未添加干员" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {operation.groups.length === 0 && (
                <EmptyOperator
                  title="暂无干员组"
                  description="作业并未添加干员组"
                />
              )}
            </div>
          </div>

          <div className="col-span-2">
            <H4 className="mb-4">动作序列</H4>

            <ViewerActions actions={operationDoc.actions} />
          </div>
        </div>
      </div>
    </OperationDrawer>
  )
})

const OperatorCard: FC<{
  operator: string
}> = ({ operator }) => {
  const [name, skill] = operator.split('::')
  return (
    <Card elevation={Elevation.ONE} className="mb-2 last:mb-0 flex">
      <div className="flex items-center font-bold">{name}</div>
      <div className="flex-1"></div>
      <div className="flex items-center tabular-nums">
        技能<span className="font-bold ml-1">{skill}</span>
      </div>
    </Card>
  )
}

const EmptyOperator: FC<{
  title?: string
  description?: string
}> = ({ title = '暂无干员', description }) => (
  <NonIdealState
    className="my-2"
    title={title}
    description={description}
    icon="slash"
    layout="horizontal"
  />
)
