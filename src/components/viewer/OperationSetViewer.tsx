import {
  Alert,
  Button,
  H3,
  H4,
  H5,
  Icon,
  Menu,
  MenuItem,
  NonIdealState,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import { ErrorBoundary } from '@sentry/react'

import {
  deleteOperationSet,
  useOperationSet,
  useRefreshOperationSets,
} from 'apis/operation-set'
import { useAtom } from 'jotai'
import { ComponentType, FC, useEffect, useState } from 'react'
import { copyShortCode } from 'services/operation'

import { FactItem } from 'components/FactItem'
import { OperationList } from 'components/OperationList'
import { Paragraphs } from 'components/Paragraphs'
import { RelativeTime } from 'components/RelativeTime'
import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { DrawerLayout } from 'components/drawer/DrawerLayout'
import { OperationSetEditorDialog } from 'components/operation-set/OperationSetEditor'
import { OperationSet } from 'models/operation-set'
import { authAtom } from 'store/auth'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { formatError } from '../../utils/error'
import { UserName } from '../UserName'

const ManageMenu: FC<{
  operationSet: OperationSet
  onUpdate: () => void
}> = ({ operationSet, onUpdate }) => {
  const refreshOperationSets = useRefreshOperationSets()

  const [loading, setLoading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await wrapErrorMessage(
        (e) => `删除失败：${formatError(e)}`,
        deleteOperationSet({ id: operationSet.id }),
      )

      refreshOperationSets()

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
        <H4>删除作业集</H4>
        <p>确定要删除作业集吗？</p>
      </Alert>

      <OperationSetEditorDialog
        operationSet={operationSet}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
      />

      <Menu>
        <MenuItem
          icon="edit"
          text="编辑作业集..."
          shouldDismissPopover={false}
          onClick={() => setEditorOpen(true)}
        />
        <MenuItem
          icon="delete"
          intent="danger"
          text="删除作业集..."
          shouldDismissPopover={false}
          onClick={() => setDeleteDialogOpen(true)}
        />
      </Menu>
    </>
  )
}

export const OperationSetViewer: ComponentType<{
  operationSetId: OperationSet['id']
  onCloseDrawer: () => void
}> = withSuspensable(
  function OperationSetViewer({ operationSetId, onCloseDrawer }) {
    const { data: operationSet, error } = useOperationSet({
      id: operationSetId,
      suspense: true,
    })

    useEffect(() => {
      // on finished loading, scroll to #fragment if any
      if (operationSet) {
        const fragment = window.location.hash
        if (fragment) {
          const el = document.querySelector(fragment)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    }, [operationSet])

    const [auth] = useAtom(authAtom)

    // make eslint happy: we got Suspense out there
    if (!operationSet) throw new Error('unreachable')

    useEffect(() => {
      if (error) {
        AppToaster.show({
          intent: 'danger',
          message: `刷新作业集失败：${formatError(error)}`,
        })
      }
    }, [error])

    return (
      <DrawerLayout
        title={
          <>
            <Icon icon="document" />
            <span className="ml-2">ZOOT Plus 作业集</span>

            <div className="flex-1" />

            {operationSet.creatorId === auth.userId && (
              <Popover2
                content={
                  <ManageMenu
                    operationSet={operationSet}
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
              icon="clipboard"
              text="复制神秘代码"
              intent="primary"
              onClick={() => copyShortCode(operationSet)}
            />
          </>
        }
      >
        <ErrorBoundary
          fallback={
            <NonIdealState
              icon="issue"
              title="渲染错误"
              description="渲染此作业集时出现了问题。是否是还未支持的作业集类型？"
            />
          }
        >
          <OperationSetViewerInner operationSet={operationSet} />
        </ErrorBoundary>
      </DrawerLayout>
    )
  },
  {
    pendingTitle: '作业集加载中',
  },
)

function OperationSetViewerInner({
  operationSet,
}: {
  operationSet: OperationSet
}) {
  return (
    <div className="h-full overflow-auto py-4 px-8 pt-8">
      <H3>{operationSet.name}</H3>

      <div className="grid grid-rows-1 grid-cols-3 gap-8">
        <div className="flex flex-col">
          <Paragraphs content={operationSet.description} linkify />
        </div>

        <div className="flex flex-col items-start select-none tabular-nums">
          <FactItem title="发布于" icon="time">
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              <RelativeTime moment={operationSet.createTime} />
            </span>
          </FactItem>

          <FactItem title="作者" icon="user">
            <UserName
              className="text-gray-800 dark:text-slate-100 font-bold"
              userId={operationSet.creatorId}
            >
              {operationSet.creator}
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
            description="渲染此作业集的预览时出现了问题 Σ(っ °Д °;)っ"
            className="h-96 bg-stripe rounded"
          />
        }
      >
        <OperationSetViewerInnerDetails operationSet={operationSet} />
      </ErrorBoundary>
    </div>
  )
}
function OperationSetViewerInnerDetails({
  operationSet,
}: {
  operationSet: OperationSet
}) {
  return (
    <div className="flex flex-col">
      <H5 className="mb-4 text-slate-600">
        作业列表({operationSet.copilotIds.length})
      </H5>
      <div className="flex flex-col mb-4 max-w-screen-2xl">
        <OperationList operationIds={operationSet.copilotIds} />
      </div>
    </div>
  )
}
