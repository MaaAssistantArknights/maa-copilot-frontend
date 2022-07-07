import { Button, IconName, MenuItem } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";
import { useMemo } from "react";
import { useController, UseFormGetValues } from "react-hook-form";
import { EditorFieldProps } from "../EditorFieldProps";

interface EditorActionOperatorDirectionChoice {
  icon?: IconName;
  title: string;
  value: string | null;
}
const EditorActionOperatorDirectionSelect =
  Select2.ofType<EditorActionOperatorDirectionChoice>();

interface EditorActionOperatorDirectionProps<T>
  extends EditorFieldProps<T> {
  getValues: UseFormGetValues<T>;
}

export const EditorActionOperatorDirection = <T extends { type?: string }>({
  name,
  control,
  getValues,
}: EditorActionOperatorDirectionProps<T>) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    rules: {
      validate: (v) => {
        if (getValues().type === "Deploy" && !v)
          return "部署动作下必须选择朝向";
        return true;
      },
    },
  });

  const items = useMemo<EditorActionOperatorDirectionChoice[]>(
    () => [
      {
        icon: "slash",
        title: "选择朝向",
        value: null,
      },
      {
        icon: "arrow-up",
        title: "上",
        value: "Up",
      },
      {
        icon: "arrow-down",
        title: "下",
        value: "Down",
      },
      {
        icon: "arrow-left",
        title: "左",
        value: "Left",
      },
      {
        icon: "arrow-right",
        title: "右",
        value: "Right",
      },
    ],
    []
  );

  const selected = items.find((item) => item.value === (value ?? null));

  return (
    <EditorActionOperatorDirectionSelect
      filterable={false}
      items={items}
      itemRenderer={(action, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          selected={modifiers.active}
          key={action.value}
          onClick={handleClick}
          onFocus={handleFocus}
          icon={action.icon}
          text={action.title}
        />
      )}
      onItemSelect={(item) => {
        onChange(item.value);
      }}
    >
      <Button
        icon={selected?.icon}
        text={selected?.title}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </EditorActionOperatorDirectionSelect>
  );
};
