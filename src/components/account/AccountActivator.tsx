import { NonIdealState, Spinner } from '@blueprintjs/core'
import { requestActivation } from 'apis/auth'
import { AppToaster } from 'components/Toaster'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NetworkError } from 'utils/fetcher'
import { useNetworkState } from 'utils/useNetworkState'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

export const AccountActivator: FC<{
  code: string
}> = ({ code }) => {
  const { networkState, start, finish } = useNetworkState()
  const navigate = useNavigate()

  useEffect(() => {
    start()
    wrapErrorMessage(
      (e: NetworkError) => `激活账号失败：${e.responseMessage}`,
      requestActivation(code),
    )
      .then(() => {
        finish(null)

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
  }, [])

  if (networkState.loading)
    return <NonIdealState icon={<Spinner />} title="正在激活账号中..." />
  if (networkState.error)
    return <NonIdealState icon="error" title="激活账号失败" />
  return <NonIdealState icon="tick" title="激活成功" />
}
