import { InputGroup, InputGroupProps2 } from '@blueprintjs/core'
import { ControllerProps, FieldValues, UseControllerProps } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormField, FormFieldProps } from 'components/FormField'
import { REGEX_EMAIL, REGEX_USERNAME } from 'utils/regexes'

export type RuleKeys = 'email' | 'password' | 'username' | 'registertoken'

// Define rules with translation keys
export const rule: Record<RuleKeys, UseControllerProps['rules']> = {
  email: {
    required: 'components.account.AuthFormShared.email_required',
    pattern: { value: REGEX_EMAIL, message: 'components.account.AuthFormShared.email_invalid' },
  },
  password: {
    required: 'components.account.AuthFormShared.password_required',
    minLength: { value: 8, message: 'components.account.AuthFormShared.password_min_length' },
    maxLength: { value: 32, message: 'components.account.AuthFormShared.password_max_length' },
  },
  username: {
    required: 'components.account.AuthFormShared.username_required',
    minLength: { value: 4, message: 'components.account.AuthFormShared.username_min_length' },
    maxLength: { value: 24, message: 'components.account.AuthFormShared.username_max_length' },
    pattern: { value: REGEX_USERNAME, message: 'components.account.AuthFormShared.username_pattern' },
  },
  registertoken: {
    required: 'components.account.AuthFormShared.token_required',
    minLength: { value: 6, message: 'components.account.AuthFormShared.token_length' },
    maxLength: { value: 6, message: 'components.account.AuthFormShared.token_length' },
  },
}

// Helper function that translates rule messages
function useTranslatedRules() {
  const { t } = useTranslation()

  return function translateRule(ruleObj: UseControllerProps['rules']) {
    if (!ruleObj) return ruleObj

    const result: UseControllerProps['rules'] = {}

    for (const [key, value] of Object.entries(ruleObj)) {
      if (typeof value === 'string') {
        result[key] = t(value)
      } else if (typeof value === 'object' && value !== null) {
        result[key] = { ...value }
        if (typeof value.message === 'string') {
          result[key].message = t(value.message)
        }
      } else {
        result[key] = value
      }
    }

    return result
  }
}

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
  const translateRule = useTranslatedRules()

  return (
    <FormField
      label={label || t('components.account.AuthFormShared.email')}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: translateRule(rule.email),
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
        helperText: register && t('components.account.AuthFormShared.email_verification_note'),
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
  const translateRule = useTranslatedRules()

  return (
    <FormField
      label={label || t('components.account.AuthFormShared.token')}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: translateRule(rule.registertoken),
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
        helperText: register && t('components.account.AuthFormShared.token_verification_note'),
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
  const translateRule = useTranslatedRules()

  return (
    <FormField
      label={label || t('components.account.AuthFormShared.password')}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: translateRule(rule.password),
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
  const translateRule = useTranslatedRules()

  return (
    <FormField
      label={label || t('components.account.AuthFormShared.username')}
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: translateRule(rule.username),
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
