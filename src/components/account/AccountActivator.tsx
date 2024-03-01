import { NonIdealState, Spinner } from '@blueprintjs/core'

import { requestActivation } from 'apis/auth'
import { useAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppToaster } from 'components/Toaster'
import { NetworkError } from 'utils/error'
import { useNetworkState } from 'utils/useNetworkState'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { authAtom } from '../../store/auth'

export const AccountActivator: FC<{
  code: string
}> = ({ code }) => {
  const { networkState, start, finish } = useNetworkState()
  const navigate = useNavigate()

  const [authState, setAuthState] = useAtom(authAtom)
  const latestAuthState = useRef(authState)
  latestAuthState.current = authState

  useEffect(() => {
    start()

    if (latestAuthState.current.activated) {
      AppToaster.show({
        intent: 'primary',
        message: '账号已激活，返回首页中...',
      })
      navigate('/', { replace: true })
    } else {
      wrapErrorMessage(
        (e: NetworkError) => `激活账号失败：${e.message}`,
        requestActivation(code),
      )
        .then(() => {
          finish(null)

          setAuthState({
            ...latestAuthState.current,
            activated: true,
          })

          AppToaster.show({
            intent: 'success',
            message: '账号激活成功，欢迎使用 MAA Copilot',
          })

          AppToaster.show({
            intent: 'primary',
            message: '返回首页中...',
          })

          navigate('/', { replace: true })
        })
        .catch((error) => finish(error))
    }
  }, [code])

  if (networkState.loading)
    return <NonIdealState icon={<Spinner />} title="正在激活账号中..." />
  if (networkState.error)
    return <NonIdealState icon="error" title="激活账号失败" />
  return <NonIdealState icon="tick" title="激活成功" />
}
