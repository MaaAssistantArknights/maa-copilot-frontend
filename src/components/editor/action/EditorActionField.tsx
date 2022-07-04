import { UseControllerProps } from "react-hook-form";

export interface EditorActionFieldProps<T> {
  name: UseControllerProps<T>["name"];
  control: UseControllerProps<T>["control"];
}
