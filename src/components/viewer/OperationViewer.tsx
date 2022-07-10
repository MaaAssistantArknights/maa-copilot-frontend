import { Button, H4, Icon, InputGroup, TextArea } from "@blueprintjs/core";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "src/components/FormField";
import { HelperText } from "src/components/HelperText";
import { OperationDrawer } from "../drawer/OperationDrawer";
import { EditorActions } from "../editor/action/EditorActions";
import { EditorPerformerAdd } from "../editor/operator/EditorOperators";

export const OperationViewer: FC<{
  operation?: CopilotDocV1.Operation;
}> = ({ operation }) => {
  const { control } = useForm<CopilotDocV1.Operation>({
    defaultValues: operation,
  });

  console.info("operation", operation);

  return (
    <OperationDrawer
      title={
        <>
          <Icon icon="document" />
          <span className="ml-2">MAA Copilot 作业</span>

          <div className="flex-1"></div>

          <Button className="ml-4" icon="clipboard" text="复制神秘代码" />

          <Button
            intent="primary"
            className="ml-4"
            icon="download"
            text="下载 JSON"
          />
        </>
      }
    >
      <div className="h-full overflow-auto py-4 px-8 pt-8">
        <H4>作业信息</H4>
        <div className="flex">
          <div className="w-1/4 mr-8">
            <FormField
              label="关卡名"
              field="stageName"
              control={control}
              FormGroupProps={{
                helperText: "除危机合约外，均请填写关卡中文名",
                disabled: true,
              }}
              ControllerProps={{
                render: ({ field }) => (
                  <InputGroup
                    readOnly
                    large
                    id="stageName"
                    placeholder="如：暴君 / 不要恐慌"
                    {...field}
                  />
                ),
              }}
            />
          </div>
          <div className="w-3/4">
            <FormField
              label="作业标题"
              field="doc.title"
              control={control}
              ControllerProps={{
                render: ({ field }) => (
                  <InputGroup
                    large
                    id="doc.title"
                    placeholder="起一个引人注目的标题吧"
                    {...field}
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="flex">
          <div className="w-1/4 mr-8"></div>
          <div className="w-3/4">
            <FormField
              label="作业描述"
              field="doc.details"
              control={control}
              ControllerProps={{
                render: ({ field }) => (
                  <TextArea
                    fill
                    rows={4}
                    growVertically
                    large
                    id="doc.details"
                    placeholder="如：作者名、参考的视频攻略链接（如有）等"
                    {...field}
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6"></div>

        <div className="flex h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)]">
          <div className="w-1/3 mr-8 flex flex-col">
            <H4>干员与干员组</H4>
            <HelperText className="mb-4">
              <span>右键以展开上下文菜单</span>
            </HelperText>
            <EditorPerformerAdd />
          </div>
          <div className="w-2/3">
            <H4>动作序列</H4>
            <HelperText className="mb-4">
              <span>拖拽以重新排序</span>
              <span>右键以展开上下文菜单</span>
            </HelperText>
            <EditorActions control={control} />
          </div>
        </div>
      </div>
    </OperationDrawer>
  );
};
