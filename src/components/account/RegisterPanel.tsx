import { Button } from '@blueprintjs/core'

import { reqeustRegistrationToken, requestRegister } from 'apis/auth'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { NetworkError } from 'utils/fetcher'
import { REGEX_EMAIL } from 'utils/regexes'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import {
  AuthFormEmailField,
  AuthFormPasswordField,
  AuthFormUsernameField,
  AuthRegistrationTokenField,
} from './AuthFormShared'

export interface RegisterFormValues {
  email: string
  password: string
  username: string
  registrationToken: string
}

export const RegisterPanel: FC<{
  onComplete: () => void
}> = ({ onComplete }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    getValues,
  } = useForm<RegisterFormValues>()
  const [isSendEmailButtonDisabled, setSendEmailButtonDisabled] =
    useState(false)
  const [countdown, setCountdown] = useState(60)
  const onSubmit = async (val: RegisterFormValues) => {
    await wrapErrorMessage(
      (e: NetworkError) => `注册失败：${e.message}`,
      requestRegister(
        val.email,
        val.registrationToken,
        val.username,
        val.password,
      ),
    )
    AppToaster.show({
      intent: 'success',
      message: `注册成功`,
    })
    onComplete()
  }
  const handleCountdownTick = () => {
    setCountdown((prevCountdown) => prevCountdown - 1)
  }
  useEffect(() => {
    let countdownInterval
    if (countdown <= 0) {
      setCountdown(60)
      setSendEmailButtonDisabled(false)
    } else if (isSendEmailButtonDisabled) {
      countdownInterval = setInterval(handleCountdownTick, 1000)
    }
    return () => clearInterval(countdownInterval)
  }, [isSendEmailButtonDisabled, countdown])

  const onEmailSubmit = async () => {
    const val = getValues()
    if (!REGEX_EMAIL.test(val.email)) {
      AppToaster.show({
        intent: 'danger',
        message: `邮箱输入为空或格式错误,请重新输入`,
      })
      return
    }
    await wrapErrorMessage(
      (e: NetworkError) => `发送失败：${e.message}`,
      reqeustRegistrationToken(val.email),
    )
    AppToaster.show({
      intent: 'success',
      message: `邮件发送成功`,
    })
    setSendEmailButtonDisabled(true)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormEmailField
        register
        control={control}
        error={errors.email}
        field="email"
      />
      <div className="mt-6 flex justify-end">
        <Button
          disabled={
            (!isValid && !isDirty) || isSubmitting || isSendEmailButtonDisabled
          }
          intent="primary"
          type="button"
          icon="envelope"
          className="self-stretch"
          onClick={onEmailSubmit}
        >
          {isSendEmailButtonDisabled ? `${countdown} 秒再试` : '发送验证码'}
        </Button>
      </div>
      <AuthRegistrationTokenField
        register
        control={control}
        error={errors.registrationToken}
        field="registrationToken"
      />

      <AuthFormUsernameField
        control={control}
        error={errors.username}
        field="username"
      />

      <AuthFormPasswordField
        control={control}
        error={errors.password}
        field="password"
      />

      <div className="mt-6 flex justify-end">
        <Button
          disabled={(!isValid && !isDirty) || isSubmitting}
          intent="primary"
          loading={isSubmitting}
          type="submit"
          icon="envelope"
          className="self-stretch"
        >
          注册
        </Button>
      </div>
    </form>
  )
}
