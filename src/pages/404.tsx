import { Button, NonIdealState } from '@blueprintjs/core'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { ComponentType } from 'react'
import { Link } from 'react-router-dom'

export const NotFoundPage: ComponentType = withGlobalErrorBoundary(() => {
  return (
    <NonIdealState
      className="py-16"
      icon="slash"
      title="未找到页面"
      description="请检查您的 URL 是否正确"
      action={
        <Link to="/">
          <Button intent="primary" text="返回首页" />
        </Link>
      }
    />
  )
})
