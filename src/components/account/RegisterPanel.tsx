import { Button } from '@blueprintjs/core'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { requestRegister } from 'apis/auth'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'
import { AppToaster } from 'components/Toaster'
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
      (e: NetworkError) => `注册失败：${e.responseMessage}`,
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
        >
          注册
        </Button>
      </div>
    </form>
  )
}
