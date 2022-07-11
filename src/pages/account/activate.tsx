import { FC, useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { NonIdealState } from '@blueprintjs/core'
import { useAtom } from 'jotai'
import { authAtom } from 'store/auth'
import { AccountActivator } from '../../components/account/AccountActivator'

export const AccountActivatePage: FC = () => {
  const [auth] = useAtom(authAtom)
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token')?.trim()
  }, [location])

  useEffect(() => {
    if (!token || token.length === 0) {
      setError('Token 不可为空；请检查邮件内容后重试')
      return
    } else {
      setError(null)
    }
  }, [token])

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
        />
      )
    if (error)
      return <NonIdealState title="激活失败" description={error} icon="error" />
    return null
  }, [error])

  return (
    <div className="my-16">
      {errorChild || <AccountActivator code={token!} />}
    </div>
  )
}
