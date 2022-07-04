import { FormGroup, FormGroupProps, Icon, Tag } from "@blueprintjs/core";
import {
  Popover2InteractionKind,
  Tooltip2,
  Tooltip2Props
} from "@blueprintjs/popover2";
import { ReactNode } from "react";
import {
  Control,
  Controller,
  ControllerProps,
  FieldError,
  Path
} from "react-hook-form";
import { WithChildren } from "../types";

export interface FormFieldRenderProps<T> {
  name: Path<T>;
  control: Control<T>;
  props?: Omit<ControllerProps<T>, "name" | "render">;
}

export interface FormFieldProps<T> {
  FormGroupProps?: Omit<FormGroupProps, "label" | "labelFor">;
  control: Control<T>;
  error?: FieldError;
  label: ReactNode;
  field: Path<T>;
  ControllerProps?: Omit<ControllerProps<T>, "name">;
  render?: (props: FormFieldRenderProps<T>) => ReactNode;
}

export const FormField = <T,>({
  ControllerProps,
  FormGroupProps,
  control,
  error,
  label,
  field,
  render,
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
        FormGroupProps?.labelInfo || (ControllerProps?.rules?.required && "*")
      }
      {...FormGroupProps}
    >
      {render ? (
        render({ name: field, control, props: ControllerProps })
      ) : (
        <Controller control={control} name={field} {...ControllerProps!} />
      )}
    </FormGroup>
  );
};

export interface FormField2Props<T> {
  FormGroupProps?: Omit<FormGroupProps, "label" | "labelFor">;
  className?: string;
  error?: any;
  label: ReactNode;
  field: Path<T>;
  asterisk?: boolean;
  description?: Tooltip2Props["content"];
}

export const FormField2 = <T,>({
  FormGroupProps,
  className,
  error,
  label,
  field,
  asterisk,
  description,
  children,
}: WithChildren<FormField2Props<T>>) => {
  return (
    <FormGroup
      className={className}
      label={
        <div className="inline-block w-full">
          <span>{label}</span>
          {description && (
            <Tooltip2
              className="!inline-block !mt-0"
              interactionKind={Popover2InteractionKind.HOVER}
              content={
                typeof description === "string" ? (
                  <div className="max-w-sm">{description}</div>
                ) : (
                  description
                )
              }
            >
              <Icon className="ml-1 text-slate-600" icon="help" />
            </Tooltip2>
          )}
          {asterisk && (
            <span className="ml-1 text-slate-600">*</span>
          )}
          {error && (
            <Tag minimal intent="danger" className="float-right">
              {error.message}
            </Tag>
          )}
        </div>
      }
      labelFor={field}
      {...FormGroupProps}
    >
      {children}
    </FormGroup>
  );
};
