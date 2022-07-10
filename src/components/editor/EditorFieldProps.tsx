import { UseControllerProps } from 'react-hook-form'

export interface EditorFieldProps<T> {
  name: UseControllerProps<T>['name']
  control: UseControllerProps<T>['control']
}
