import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Elevation,
  H3,
  H4,
  H5,
  Icon,
  Menu,
  MenuItem,
  NonIdealState,
  Tag,
} from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { requestDeleteOperation } from 'apis/copilotOperation'
import { useOperation } from 'apis/query'
import { apiPostRating } from 'apis/rating'
import { OperationDrawer } from 'components/drawer/OperationDrawer'
import { EDifficultyLevel } from 'components/entity/ELevel'
import { FactItem } from 'components/FactItem'
import { Paragraphs } from 'components/Paragraphs'
import { RelativeTime } from 'components/RelativeTime'
import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { OperationRating } from 'components/viewer/OperationRating'
import { ViewerActions } from 'components/viewer/ViewerActions'
import { useAtom } from 'jotai'
import { merge } from 'lodash-es'
import { Operation, OpRatingType } from 'models/operation'
import { ComponentType, FC, useMemo, useState } from 'react'
import { authAtom } from 'store/auth'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

const ManageMenu: FC<{
  operation: Operation
  onUpdate: () => void
}> = ({ operation, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await wrapErrorMessage(
        (e: NetworkError) => `删除失败：${e.message}`,
        requestDeleteOperation(operation.id),
      )
    } finally {
      setLoading(false)
    }
    AppToaster.show({
      intent: 'success',
      message: `删除成功`,
    })
    setDeleteDialogOpen(false)
    onUpdate()
  }

  return (
    <>
      <Alert
        isOpen={deleteDialogOpen}
        cancelButtonText="取消"
        confirmButtonText="删除"
        icon="log-out"
        intent="danger"
        canOutsideClickCancel
        loading={loading}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      >
        <H4>删除作业</H4>
        <p>确定要删除作业吗？</p>
      </Alert>

      <Menu>
        <MenuItem icon="edit" text="修改作业" disabled />
        <MenuItem
          icon="delete"
          intent="danger"
          text="删除作业..."
          shouldDismissPopover={false}
          onClick={() => setDeleteDialogOpen(true)}
        />
      </Menu>
    </>
  )
}

export const OperationViewer: ComponentType<{
  operationId: string
  onCloseDrawer: () => void
}> = withSuspensable(({ operationId, onCloseDrawer }) => {
  const { data, error, mutate } = useOperation(operationId)
  const operation = data?.data

  const [auth] = useAtom(authAtom)
  const authed = !!auth.token

  // make eslint happy: we got Suspense out there
  if (!operation) return null

  if (error) {
    return (
      <NonIdealState icon="error" title="获取作业失败" description={error} />
    )
  }

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

    const blob = new Blob([content], {
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

  const handleRating = async (decision: OpRatingType) => {
    mutate(
      async (val) => {
        const response = await apiPostRating(operationId, decision)

        return merge(val, response)
      },
      {
        // optimisticData: (current) =>
        //   merge(current, {
        //     data: { ...operation, ratingType: decision },
        //   }),
        rollbackOnError: true,
      },
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

          {operation.uploader === auth.username && (
            <Popover2
              content={
                <ManageMenu
                  operation={operation}
                  onUpdate={() => onCloseDrawer()}
                />
              }
            >
              <Button
                className="ml-4"
                icon="wrench"
                text="管理"
                rightIcon="caret-down"
              />
            </Popover2>
          )}

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
            <Paragraphs content={operation?.detail} linkify />
          </div>

          <div className="flex flex-col">
            <FactItem title="作战">
              <Tag
                className="bg-slate-100 text-slate-900 border border-slate-300 border-solid"
                large
              >
                <EDifficultyLevel
                  level={operation.level}
                  difficulty={operation.difficulty}
                />
              </Tag>
            </FactItem>

            <FactItem relaxed className="items-start" title="作业评分">
              <OperationRating operation={operation} className="mr-2" />

              {/* only show like or dislike if the user is authed. otherwise, hide it */}
              {authed && (
                <ButtonGroup className="flex items-center ml-2">
                  <Tooltip2 content="o(*≧▽≦)ツ" placement="bottom">
                    <Button
                      icon="thumbs-up"
                      intent={
                        operation?.ratingType === OpRatingType.Like
                          ? 'success'
                          : 'none'
                      }
                      className="mr-2"
                      active={operation?.ratingType === OpRatingType.Like}
                      onClick={() => handleRating(OpRatingType.Like)}
                    />
                  </Tooltip2>
                  <Tooltip2 content=" ヽ(。>д<)ｐ" placement="bottom">
                    <Button
                      icon="thumbs-down"
                      intent={
                        operation?.ratingType === OpRatingType.Dislike
                          ? 'danger'
                          : 'none'
                      }
                      active={operation?.ratingType === OpRatingType.Dislike}
                      onClick={() => handleRating(OpRatingType.Dislike)}
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

            <FactItem title="作者" icon="user">
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
                <OperatorCard key={operator} operator={operator} />
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
                        <OperatorCard key={operator} operator={operator} />
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
