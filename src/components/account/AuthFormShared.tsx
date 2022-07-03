import { InputGroup } from "@blueprintjs/core";
import { FormField, FormFieldProps } from "components/FormField";
import { UseControllerProps } from "react-hook-form";
import { REGEX_EMAIL } from '../../utils/regexes';

export type RuleKeys = 'email' | 'password' | 'username';

export const rule: Record<RuleKeys, UseControllerProps["rules"]> = {
  email: {
    required: "邮箱为必填项",
    pattern: { value: REGEX_EMAIL, message: "不合法的邮箱" },
  },
  password: {
    required: "密码为必填项",
    minLength: { value: 8, message: "密码长度不能小于 8 位" },
    maxLength: { value: 32, message: "密码长度不能大于 32 位" },
  },
  username: {
    required: "用户名为必填项",
    minLength: { value: 4, message: "用户名长度不能小于 4 位" },
    maxLength: { value: 24, message: "用户名长度不能大于 24 位" },
  }
};

// --- **Opinioned** AuthForm Field Components ---

export const AuthFormEmailField = <T extends {}>({
  control,
  error,
  field,
}: Pick<FormFieldProps<T>, "control" | "error" | "field">) => {
  return (
    <FormField
      label="邮箱"
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.email,
        render: ({ field }) => (
          <InputGroup
            id="email"
            placeholder="user@example.com"
            autoFocus
            autoCorrect="none"
            autoCapitalize="none"
            autoComplete="email"
            {...field}
          />
        ),
      }}
    />
  );
};

export const AuthFormPasswordField = <T extends {}>({
  control,
  error,
  field,
}: Pick<FormFieldProps<T>, "control" | "error" | "field">) => {
  return (
    <FormField
      label="密码"
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.password,
        render: ({ field: fieldBinding }) => (
          <InputGroup
            id={field}
            placeholder="· · · · · ·"
            type="password"
            autoCorrect="none"
            autoCapitalize="none"
            autoComplete="current-password"
            {...fieldBinding}
          />
        ),
      }}
    />
  );
};

export const AuthFormUsernameField = <T extends {}>({
  control,
  error,
  field,
}: Pick<FormFieldProps<T>, "control" | "error" | "field">) => {
  return (
    <FormField
      label="用户名"
      field={field}
      control={control}
      error={error}
      ControllerProps={{
        rules: rule.password,
        render: ({ field: fieldBinding }) => (
          <InputGroup
            id={field}
            placeholder="Pallas-Bot"
            autoCorrect="none"
            autoCapitalize="none"
            autoComplete="username"
            {...fieldBinding}
          />
        ),
      }}
    />
  );
};
