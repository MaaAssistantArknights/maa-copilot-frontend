import { InputGroup, InputGroupProps2 } from '@blueprintjs/core'

import {
  ControllerProps,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormField, FormFieldProps } from 'components/FormField'
import { REGEX_EMAIL, REGEX_USERNAME } from 'utils/regexes'

export type RuleKeys = 'email' | 'password' | 'username' | 'registertoken'

export function useAuthRules() {
  const { t } = useTranslation()

  return {
    email: {
      required: t('components.account.AuthFormShared.email_required'),
      pattern: {
        value: REGEX_EMAIL,
        message: t('components.account.AuthFormShared.email_invalid'),
      },
    },
    password: {
      required: t('components.account.AuthFormShared.password_required'),
      minLength: {
        value: 8,
        message: t('components.account.AuthFormShared.password_min_length'),
      },
      maxLength: {
        value: 32,
        message: t('components.account.AuthFormShared.password_max_length'),
      },
    },
    username: {
      required: t('components.account.AuthFormShared.username_required'),
      minLength: {
        value: 4,
        message: t('components.account.AuthFormShared.username_min_length'),
      },
      maxLength: {
        value: 24,
        message: t('components.account.AuthFormShared.username_max_length'),
      },
    },
    registertoken: {
      required: t('components.account.AuthFormShared.token_required'),
      minLength: {
        value: 6,
        message: t('components.account.AuthFormShared.token_length'),
      },
      maxLength: {
        value: 6,
        message: t('components.account.AuthFormShared.token_length'),
      },
    },
  }
}

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
    pattern: { value: REGEX_USERNAME, message: '用户名前后不能包含空格' },
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
  label,
  control,
  error,
  field,
  register,
  autoComplete = 'email',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  const { t } = useTranslation()
  label = label || t('components.account.AuthFormShared.email')
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
        helperText:
          register &&
          t('components.account.AuthFormShared.email_verification_note'),
      }}
    />
  )
}

export const AuthRegistrationTokenField = <T extends FieldValues>({
  label,
  control,
  error,
  field,
  register,
  autoComplete = '',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  const { t } = useTranslation()
  label =
    label || t('components.account.AuthFormShared.email_verification_code')
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
        helperText:
          register && t('components.account.AuthFormShared.enter_email_code'),
      }}
    />
  )
}

export const AuthFormPasswordField = <T extends FieldValues>({
  label,
  control,
  error,
  field,
  autoComplete = 'current-password',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  const { t } = useTranslation()
  label = label || t('components.account.AuthFormShared.password')
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
  label,
  control,
  error,
  field,
  autoComplete = 'username',
  inputGroupProps,
}: AuthFormFieldProps<T>) => {
  const { t } = useTranslation()
  label = label || t('components.account.AuthFormShared.username')
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
