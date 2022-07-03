import {
  FormGroup,
  FormGroupProps, Tag
} from "@blueprintjs/core";
import { ReactNode } from "react";
import {
  Control,
  Controller,
  ControllerProps,
  FieldError,
  Path
} from "react-hook-form";

export interface FormFieldProps<T> {
  ControllerProps: Omit<ControllerProps<T>, "name">;
  FormGroupProps?: Omit<FormGroupProps, "label" | "labelFor">;
  control: Control<T>;
  error?: FieldError;
  label: ReactNode;
  field: Path<T>;
}

export const FormField = <T,>({
  ControllerProps,
  FormGroupProps,
  control,
  error,
  label,
  field,
}: FormFieldProps<T>) => {
  return (
    <FormGroup
      label={
        <span>
          {label}
          {error && (
            <Tag minimal intent="danger" className="float-right">
              {error.message}
            </Tag>
          )}
        </span>
      }
      labelFor={field}
      labelInfo={
        FormGroupProps?.labelInfo || (ControllerProps.rules?.required && "*")
      }
      {...FormGroupProps}
    >
      <Controller control={control} name={field} {...ControllerProps} />
    </FormGroup>
  );
};
