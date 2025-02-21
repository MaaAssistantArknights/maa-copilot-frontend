import { Button, ButtonGroup, Card } from '@blueprintjs/core'

import { ComponentType, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { OperationList } from 'components/OperationList'
import { OperationSetList } from 'components/OperationSetList'
import { OperationDrawer } from 'components/drawer/OperationDrawer'

import { useUserInfo } from '../apis/user'
import { CardTitle } from '../components/CardTitle'
import { withSuspensable } from '../components/Suspensable'
import { NotFoundError } from '../utils/error'

const _ProfilePage: ComponentType = () => {
  const { id } = useParams()
  if (!id) {
    // edge case?
    throw new Error('ID 无效')
  }

  const { data: userInfo } = useUserInfo({ userId: id, suspense: true })

  const [listMode, setListMode] = useState<'operation' | 'operationSet'>(
    'operation',
  )

  return (
    <div className="flex flex-col md:flex-row px-8 mt-8 max-w-[96rem] mx-auto">
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8">
        <div className="mb-4 flex flex-wrap">
          <ButtonGroup className="mr-2">
            <Button
              icon="document"
              active={listMode === 'operation'}
              onClick={() => setListMode('operation')}
            >
              作业
            </Button>
            <Button
              icon="folder-close"
              active={listMode === 'operationSet'}
              onClick={() => setListMode('operationSet')}
            >
              作业集
            </Button>
          </ButtonGroup>
        </div>

        <div className="tabular-nums">
          {listMode === 'operation' && (
            <OperationList limit={10} orderBy="id" uploaderId={id} />
          )}
          {listMode === 'operationSet' && <OperationSetList creatorId={id} />}
        </div>
      </div>
      <div className="md:w-1/3 order-1 md:order-2">
        <div className="sticky top-20">
          <Card className="flex flex-col mb-4 space-y-2">
            <CardTitle icon="user">{userInfo?.userName}</CardTitle>
          </Card>
        </div>
      </div>

      <OperationDrawer />
    </div>
  )
}
_ProfilePage.displayName = 'ProfilePage'

export const ProfilePage = withSuspensable(_ProfilePage, {
  errorFallback: ({ error }) => {
    if (error instanceof NotFoundError) {
      return <Navigate to="/404" replace />
    }
    return undefined
  },
})
