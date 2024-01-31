import { InputGroup, InputGroupProps2 } from '@blueprintjs/core'

import {
  ControllerProps,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form'

import { FormField, FormFieldProps } from 'components/FormField'
import { REGEX_EMAIL } from 'utils/regexes'

export type RuleKeys = 'email' | 'password' | 'username' | 'registertoken'

export const rule: Record<RuleKeys, UseControllerProps['rules']> = {
  email: {
    required: '邮箱为必填项',
    pattern: { value: REGEX_EMAIL, message: '不合法的邮箱' },
  },
  password: {
    required: '密码为必填项',
    minLength: { value: 8, message: '密码长度不能小于 8 位' },
    maxLength: { value: 32, message: '密码长度不能大于 32 位' },
  },
  username: {
    required: '用户名为必填项',
    minLength: { value: 4, message: '用户名长度不能小于 4 位' },
    maxLength: { value: 24, message: '用户名长度不能大于 24 位' },
  },
  registertoken: {
    required: '邮箱验证码为必填项',
    minLength: { value: 6, message: '邮箱验证码长度为 6 位' },
    maxLength: { value: 6, message: '邮箱验证码长度为 6 位' },
  },
}

// --- **Opinioned** AuthForm Field Components ---

export type AuthFormFieldProps<T extends FieldValues> = Pick<
  FormFieldProps<T, any>,
  'control' | 'error' | 'field'
> & {
  label?: string
  register?: boolean
  autoComplete?: string
  inputGroupProps?: (
    ...params: Parameters<ControllerProps<T, any>['render']>
  ) => InputGroupProps2
}

export const AuthFormEmailField = <T extends FieldValues>({
  label = '邮箱',
  control,
  error,
  field,
  register,
  autoComplete = 'email',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  return (
    <FormField
      label={label}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.email,
        render: (renderProps) => (
          <InputGroup
            id={field}
            placeholder="user@example.com"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            autoComplete={autoComplete}
            {...renderProps.field}
            value={renderProps.field.value || ''}
            {...inputGroupProps?.(renderProps)}
          />
        ),
      }}
      FormGroupProps={{
        helperText: register && '将通过发送邮件输入验证码确认',
      }}
    />
  )
}
export const AuthRegistrationTokenField = <T extends FieldValues>({
  label = '邮箱验证码',
  control,
  error,
  field,
  register,
  autoComplete = '',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  return (
    <FormField
      label={label}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.registertoken,
        render: (renderProps) => (
          <InputGroup
            id={field}
            placeholder="123456"
            autoComplete={autoComplete}
            {...renderProps.field}
            value={renderProps.field.value || ''}
            {...inputGroupProps?.(renderProps)}
          />
        ),
      }}
      FormGroupProps={{
        helperText: register && '请输入邮件中的验证码',
      }}
    />
  )
}

export const AuthFormPasswordField = <T extends FieldValues>({
  label = '密码',
  control,
  error,
  field,
  autoComplete = 'current-password',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  return (
    <FormField
      label={label}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.password,
        render: (renderProps) => (
          <InputGroup
            id={field}
            placeholder="· · · · · · · ·"
            type="password"
            autoComplete={autoComplete}
            {...renderProps.field}
            value={renderProps.field.value || ''}
            {...inputGroupProps?.(renderProps)}
          />
        ),
      }}
    />
  )
}

export const AuthFormUsernameField = <T extends FieldValues>({
  label = '用户名',
  control,
  error,
  field,
  autoComplete = 'username',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  return (
    <FormField
      label={label}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.username,
        render: (renderProps) => (
          <InputGroup
            id={field}
            placeholder="Pallas-Bot"
            autoComplete={autoComplete}
            {...renderProps.field}
            value={renderProps.field.value || ''}
            {...inputGroupProps?.(renderProps)}
          />
        ),
      }}
    />
  )
}
