import { Button, NonIdealState } from '@blueprintjs/core'
import { AccountActivator } from 'components/account/AccountActivator'
import { useAtom } from 'jotai'
import { FC, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authAtom } from 'store/auth'

export const AccountActivatePage: FC = () => {
  const [auth] = useAtom(authAtom)

  const location = useLocation()

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token')?.trim()
  }, [location])

  const backToHome = useMemo(
    () => (
      <Link to="/">
        <Button intent="primary" icon="home" text="返回首页" />
      </Link>
    ),
    [],
  )

  const errorChild = useMemo(() => {
    if (!auth.token)
      return (
        <NonIdealState
          title="未登录"
          description="登录后才可激活 MAA Copilot 账号"
          icon="error"
        />
      )
    if (auth.activated)
      return (
        <NonIdealState
          title="此账号已激活"
          description="此 MAA Copilot 账号此前已被成功激活"
          icon="error"
        >
          {backToHome}
        </NonIdealState>
      )
    if (!token || token.length === 0)
      return (
        <NonIdealState
          title="Token 不可为空"
          description="请检查邮件内容后重试"
          icon="error"
        />
      )
    return null
  }, [auth, token])

  return (
    <div className="my-16">
      {errorChild || <AccountActivator code={token!} />}
    </div>
  )
}
