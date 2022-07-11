import { FC, useEffect } from 'react'
import { useNetworkState } from '../../utils/useNetworkState'
import { requestActivation } from '../../apis/auth'
import { AppToaster } from '../Toaster'
import { useNavigate } from 'react-router-dom'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
import { NetworkError } from 'utils/fetcher'
import { NonIdealState, Spinner } from '@blueprintjs/core'

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

        navigate('/')
      })
      .catch((error) => finish(error))
  }, [])

  return networkState.loading ? (
    <NonIdealState icon={<Spinner />} title="正在激活账号中..." />
  ) : (
    <NonIdealState icon="tick" title="激活成功" />
  )
}
