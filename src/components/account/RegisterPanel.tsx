import { Button } from "@blueprintjs/core";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { AuthFormEmailField, AuthFormPasswordField, AuthFormUsernameField } from './AuthFormShared';

export interface RegisterFormValues {
  email: string;
  password: string;
  username: string;
}

export const RegisterPanel: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<RegisterFormValues>();

  const onSubmit = async (values: RegisterFormValues) => {
    console.log(values);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormEmailField
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
        >
          注册
        </Button>
      </div>
    </form>
  );
};
