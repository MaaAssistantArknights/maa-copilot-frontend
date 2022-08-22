import { Button } from '@blueprintjs/core'
import { requestRegister } from 'apis/auth'
import { AppToaster } from 'components/Toaster'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
import {
  AuthFormEmailField,
  AuthFormPasswordField,
  AuthFormUsernameField,
} from './AuthFormShared'

export interface RegisterFormValues {
  email: string
  password: string
  username: string
}

export const RegisterPanel: FC<{
  onComplete: () => void
}> = ({ onComplete }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<RegisterFormValues>()

  const onSubmit = async (val: RegisterFormValues) => {
    await wrapErrorMessage(
      (e: NetworkError) => `注册失败：${e.message}`,
      requestRegister(val.email, val.username, val.password),
    )
    AppToaster.show({
      intent: 'success',
      message: `已向注册邮箱发送验证邮件，请使用邮件内的验证链接进行验证`,
    })
    onComplete()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormEmailField
        register
        control={control}
        error={errors.email}
        field="email"
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
