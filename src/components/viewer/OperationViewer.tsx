import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Elevation,
  H3,
  H4,
  H6,
  Icon,
  Menu,
  MenuItem,
  NonIdealState,
} from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { ErrorBoundary } from '@sentry/react'

import {
  deleteOperation,
  rateOperation,
  useOperation,
  useRefreshOperations,
} from 'apis/operation'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { ComponentType, FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyShortCode, handleDownloadJSON } from 'services/operation'

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
import { OPERATORS } from '../../models/operator'
import { formatError } from '../../utils/error'
import { ActionCard } from '../ActionCard'
import { UserName } from '../UserName'
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
      mutate,
    } = useOperation({
      id: operationId,
      suspense: true,
    })

    useEffect(() => {
      // on finished loading, scroll to #fragment if any
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

    const handleRating = async (decision: OpRatingType) => {
      // cancel rating if already rated by the same type
      if (decision === operation.ratingType) {
        decision = OpRatingType.None
      }

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

    return (
      <DrawerLayout
        title={
          <>
            <Icon icon="document" />
            <span className="ml-2">MAA Copilot 作业</span>

            <div className="flex-1" />

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {operation.uploaderId === auth.userId && (
                <Popover2
                  content={
                    <ManageMenu
                      operation={operation}
                      onUpdate={() => onCloseDrawer()}
                    />
                  }
                >
                  <Button icon="wrench" text="管理" rightIcon="caret-down" />
                </Popover2>
              )}

              <Button
                icon="download"
                text="下载原 JSON"
                onClick={() => handleDownloadJSON(operation.parsedContent)}
              />

              <Button
                icon="clipboard"
                text="复制神秘代码"
                intent="primary"
                onClick={() => copyShortCode(operation)}
              />
            </div>
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
            handleRating={handleRating}
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
  const info = OPERATORS.find((o) => o.name === name)
  const skillStr = [null, '一', '二', '三'][skill ?? 1] ?? '未知'
  return (
    <div className="min-w-24 flex flex-col items-center">
      <OperatorAvatar
        id={info?.id}
        rarity={info?.rarity}
        className="w-16 h-16 mb-1"
      />
      <span className={clsx('mb-1 font-bold')}>{name}</span>
      <span className="text-xs text-zinc-500">{skillStr}技能</span>
    </div>
  )
}

function OperationViewerInner({
  levels,
  operation,
  handleRating,
}: {
  levels: Level[]
  operation: Operation
  handleRating: (decision: OpRatingType) => Promise<void>
}) {
  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      <H3>{operation.parsedContent.doc.title}</H3>

      <div className="flex flex-col-reverse md:grid grid-rows-1 grid-cols-3 gap-2 md:gap-8">
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
                  onClick={() => handleRating(OpRatingType.Like)}
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
                  onClick={() => handleRating(OpRatingType.Dislike)}
                />
              </Tooltip2>
            </ButtonGroup>
          </FactItem>
        </div>

        <div className="flex flex-wrap md:flex-col items-start select-none tabular-nums gap-4">
          <FactItem dense title="浏览量" icon="eye-open">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              {operation.views}
            </span>
          </FactItem>

          <FactItem dense title="发布于" icon="time">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              <RelativeTime moment={operation.uploadTime} />
            </span>
          </FactItem>

          <FactItem dense title="作者" icon="user">
            <UserName
              className="text-gray-800 dark:text-slate-100 font-bold"
              userId={operation.uploaderId}
            >
              {operation.uploader}
            </UserName>
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
  const [showOperators, setShowOperators] = useState(true)
  const [showActions, setShowActions] = useState(false)

  return (
    <div>
      <H4
        className="inline-flex items-center cursor-pointer hover:text-violet-500"
        onClick={() => setShowOperators((v) => !v)}
      >
        干员与干员组
        <Tooltip2
          className="!flex items-center"
          placement="top"
          content="干员组：组内干员可以任选其一，自动编队时按最高练度来选择"
        >
          <Icon icon="info-sign" size={12} className="text-zinc-500 ml-1" />
        </Tooltip2>
        <Icon
          icon="chevron-down"
          className={clsx(
            'ml-1 transition-transform',
            showOperators && 'rotate-180',
          )}
        />
      </H4>
      <Collapse isOpen={showOperators}>
        <div className="mt-2 flex flex-wrap -ml-4 gap-y-2">
          {!operation.parsedContent.opers?.length &&
            !operation.parsedContent.groups?.length && (
              <NonIdealState
                className="my-2"
                title="暂无干员"
                description="作业并未添加干员"
                icon="slash"
                layout="horizontal"
              />
            )}
          {operation.parsedContent.opers?.map((operator) => (
            <OperatorCard key={operator.name} operator={operator} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {operation.parsedContent.groups?.map((group) => (
            <Card
              elevation={Elevation.ONE}
              className="!p-2 flex flex-col items-center"
              key={group.name}
            >
              <H6 className="text-gray-800">{group.name}</H6>
              <div className="flex flex-wrap gap-y-2">
                {group.opers
                  ?.filter(Boolean)
                  .map((operator) => (
                    <OperatorCard key={operator.name} operator={operator} />
                  ))}

                {group.opers?.filter(Boolean).length === 0 && (
                  <span className="text-zinc-500">无干员</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Collapse>

      <H4
        className="mt-6 inline-flex items-center cursor-pointer hover:text-violet-500"
        onClick={() => setShowActions((v) => !v)}
      >
        动作序列
        <Icon
          icon="chevron-down"
          className={clsx(
            'ml-1 transition-transform',
            showActions && 'rotate-180',
          )}
        />
      </H4>
      <Collapse isOpen={showActions}>
        {operation.parsedContent.actions?.length ? (
          <div className="mt-2 flex flex-col pb-8">
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
      </Collapse>
    </div>
  )
}
