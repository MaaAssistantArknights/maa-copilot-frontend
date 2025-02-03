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
} from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { ErrorBoundary } from '@sentry/react'

import {
  deleteOperation,
  useOperation,
  useRefreshOperations,
} from 'apis/operation'
import { useAtom } from 'jotai'
import { ComponentType, FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyShortCode, handleDownloadJSON, handleRating } from 'services/operation'

import { FactItem } from 'components/FactItem'
import { Paragraphs } from 'components/Paragraphs'
import { RelativeTime } from 'components/RelativeTime'
import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { DrawerLayout } from 'components/drawer/DrawerLayout'
import { OperatorAvatar } from 'components/editor/operator/EditorOperator'
import { EDifficultyLevel } from 'components/entity/ELevel'
import { OperationRating } from 'components/viewer/OperationRating'
import { OpRatingType, Operation } from 'models/operation'
import { authAtom } from 'store/auth'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { useLevels } from '../../apis/level'
import { CopilotDocV1 } from '../../models/copilot.schema'
import { createCustomLevel, findLevelByStageName } from '../../models/level'
import { Level } from '../../models/operation'
import { formatError } from '../../utils/error'
import { ActionCard } from '../ActionCard'
import { CommentArea } from './comment/CommentArea'

const ManageMenu: FC<{
  operation: Operation
  onUpdate: () => void
}> = ({ operation, onUpdate }) => {
  const refreshOperations = useRefreshOperations()

  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await wrapErrorMessage(
        (e) => `删除失败：${formatError(e)}`,
        deleteOperation({ id: operation.id }),
      )

      refreshOperations()

      AppToaster.show({
        intent: 'success',
        message: `删除成功`,
      })
      setDeleteDialogOpen(false)
      onUpdate()
    } catch (e) {
      console.warn(e)
    } finally {
      setLoading(false)
    }
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
        <Link
          className="hover:[color:inherit] hover:no-underline"
          to={`/create/${operation.id}`}
        >
          <MenuItem icon="edit" text="修改作业" />
        </Link>
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
  operationId: Operation['id']
  onCloseDrawer: () => void
}> = withSuspensable(
  function OperationViewer({ operationId, onCloseDrawer }) {
    const {
      data: operation,
      error,
    } = useOperation({
      id: operationId,
      suspense: true,
    })

    useEffect(() => {
      // on finished loading, scroll to #fragment if any
      console.log("update operation")
      if (operation) {
        const fragment = window.location.hash
        if (fragment) {
          const el = document.querySelector(fragment)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    }, [operation])

    const { data: levels } = useLevels()

    const [auth] = useAtom(authAtom)

    // make eslint happy: we got Suspense out there
    if (!operation) throw new Error('unreachable')

    useEffect(() => {
      if (error) {
        AppToaster.show({
          intent: 'danger',
          message: `刷新作业失败：${formatError(error)}`,
        })
      }
    }, [error])

    return (
      <DrawerLayout
        title={
          <>
            <Icon icon="document" />
            <span className="ml-2">MAA Copilot 作业</span>

            <div className="flex-1" />

            {operation.uploader === auth.username && (
              // FIXME: 用户名可以重名，这里会让重名用户都显示管理按钮，需要等后端支持 operation.uploaderId 后再修复
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
              onClick={() => handleDownloadJSON(operation.parsedContent)}
            />

            <Button
              className="ml-4"
              icon="clipboard"
              text="复制神秘代码"
              intent="primary"
              onClick={() => copyShortCode(operation)}
            />
          </>
        }
      >
        <ErrorBoundary
          fallback={
            <NonIdealState
              icon="issue"
              title="渲染错误"
              description="渲染此作业时出现了问题。是否是还未支持的作业类型？"
            />
          }
        >
          <OperationViewerInner
            levels={levels}
            operation={operation}
          />
        </ErrorBoundary>
      </DrawerLayout>
    )
  },
  {
    pendingTitle: '作业加载中',
  },
)

const OperatorCard: FC<{
  operator: CopilotDocV1.Operator
}> = ({ operator }) => {
  const { name, skill } = operator
  return (
    <Card elevation={Elevation.ONE} className="mb-2 last:mb-0 flex">
      <OperatorAvatar name={name} size="large" className="mr-3" />
      <div className="flex items-center font-bold">{name}</div>
      <div className="flex-1" />
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

function OperationViewerInner({
  levels,
  operation,
}: {
  levels: Level[]
  operation: Operation
}) {
  return (
    <div className="h-full overflow-auto py-4 px-8 pt-8">
      <H3>{operation.parsedContent.doc.title}</H3>

      <div className="grid grid-rows-1 grid-cols-3 gap-8">
        <div className="flex flex-col">
          <Paragraphs content={operation.parsedContent.doc.details} linkify />
        </div>

        <div className="flex flex-col">
          <FactItem title="作战">
            <EDifficultyLevel
              level={
                findLevelByStageName(
                  levels,
                  operation.parsedContent.stageName,
                ) || createCustomLevel(operation.parsedContent.stageName)
              }
              difficulty={operation.parsedContent.difficulty}
            />
          </FactItem>

          <FactItem relaxed className="items-start" title="作业评分">
            <OperationRating operation={operation} className="mr-2" />

            <ButtonGroup className="flex items-center ml-2">
              <Tooltip2 content="o(*≧▽≦)ツ" placement="bottom">
                <Button
                  icon="thumbs-up"
                  intent={
                    operation.ratingType === OpRatingType.Like
                      ? 'success'
                      : 'none'
                  }
                  className="mr-2"
                  active={operation.ratingType === OpRatingType.Like}
                  onClick={() => {
                    var type = operation.ratingType === OpRatingType.Like ? OpRatingType.None : OpRatingType.Like;
                    handleRating(type, operation.id)
                  }}
                />
              </Tooltip2>
              <Tooltip2 content=" ヽ(。>д<)ｐ" placement="bottom">
                <Button
                  icon="thumbs-down"
                  intent={
                    operation.ratingType === OpRatingType.Dislike
                      ? 'danger'
                      : 'none'
                  }
                  active={operation.ratingType === OpRatingType.Dislike}
                  onClick={() => {
                    var type = operation.ratingType === OpRatingType.Dislike ? OpRatingType.None : OpRatingType.Dislike;
                    handleRating(type, operation.id)
                  }}
                />
              </Tooltip2>
            </ButtonGroup>
          </FactItem>
        </div>

        <div className="flex flex-col items-start select-none tabular-nums">
          <FactItem title="浏览量" icon="eye-open">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              {operation.views}
            </span>
          </FactItem>

          <FactItem title="发布于" icon="time">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              <RelativeTime moment={operation.uploadTime} />
            </span>
          </FactItem>

          <FactItem title="作者" icon="user">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              {operation.uploader}
            </span>
          </FactItem>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6" />

      <ErrorBoundary
        fallback={
          <NonIdealState
            icon="issue"
            title="渲染错误"
            description="渲染此作业的预览时出现了问题。是否是还未支持的作业类型？"
            className="h-96 bg-stripe rounded"
          />
        }
      >
        <OperationViewerInnerDetails operation={operation} />
      </ErrorBoundary>

      <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6" />

      <div className="mb-6">
        <div>
          <H4 className="mb-4" id="comment">
            评论 ({operation.commentsCount})
          </H4>
          <CommentArea operationId={operation.id} />
        </div>
      </div>
    </div>
  )
}
function OperationViewerInnerDetails({ operation }: { operation: Operation }) {
  return (
    <div className="grid grid-rows-1 grid-cols-3 gap-8">
      <div className="flex flex-col">
        <H4 className="mb-4">干员与干员组</H4>
        <H5 className="mb-4 text-slate-600">干员</H5>
        <div className="flex flex-col mb-4">
          {operation.parsedContent.opers?.map((operator) => (
            <OperatorCard key={operator.name} operator={operator} />
          ))}
          {!operation.parsedContent.opers?.length && (
            <EmptyOperator description="作业并未添加干员" />
          )}
        </div>

        <H5 className="mb-4 text-slate-600">干员组</H5>
        <div className="flex flex-col">
          {operation.parsedContent.groups?.map((group) => (
            <Card elevation={Elevation.ONE} className="mb-4" key={group.name}>
              <div className="flex flex-col">
                <H5 className="text-gray-800 font-bold">{group.name}</H5>

                <div className="flex flex-col">
                  {group.opers
                    ?.filter(Boolean)
                    .map((operator) => (
                      <OperatorCard key={operator.name} operator={operator} />
                    ))}

                  {group.opers?.filter(Boolean).length === 0 && (
                    <EmptyOperator description="干员组中并未添加干员" />
                  )}
                </div>
              </div>
            </Card>
          ))}

          {!operation.parsedContent.groups?.length && (
            <EmptyOperator
              title="暂无干员组"
              description="作业并未添加干员组"
            />
          )}
        </div>
      </div>

      <div className="col-span-2">
        <H4 className="mb-4">动作序列</H4>

        {operation.parsedContent.actions?.length ? (
          <div className="flex flex-col pb-8">
            {operation.parsedContent.actions.map((action, i) => (
              <ActionCard action={action} key={i} />
            ))}
          </div>
        ) : (
          <NonIdealState
            className="my-2"
            title="暂无动作"
            description="作业并未定义任何动作"
            icon="slash"
            layout="horizontal"
          />
        )}
      </div>
    </div>
  )
}
