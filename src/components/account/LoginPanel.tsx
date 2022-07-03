import { Button } from "@blueprintjs/core";
import { requestLogin } from 'apis/auth';
import { FC } from "react";
import { useForm } from "react-hook-form";
import { NetworkError } from 'utils/fetcher';
import { wrapErrorMessage } from "utils/wrapErrorMessage";
import { AuthFormEmailField, AuthFormPasswordField } from "./AuthFormShared";

export interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPanel: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (val: LoginFormValues) => {
    const res = (
      await wrapErrorMessage(
        (e: NetworkError) => `登录失败：${e.responseMessage}`,
        requestLogin(val.email, val.password)
      )
    );
    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormEmailField
        control={control}
        error={errors.email}
        field="email"
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
        >
          登录
        </Button>
      </div>
    </form>
  );
};
