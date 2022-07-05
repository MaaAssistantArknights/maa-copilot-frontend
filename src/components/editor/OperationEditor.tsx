import {
  Button,
  Card, H4,
  Icon,
  InputGroup, TextArea
} from "@blueprintjs/core";
import { FC } from "react";
import { useForm } from 'react-hook-form';
import { FormField } from "src/components/FormField";
import { HelperText } from "src/components/HelperText";
import { formatRelativeTime } from "utils/times";
import { EditorActions } from './action/EditorActions';

export const OperationEditor: FC<{
  operation?: CopilotDocV1.Operation;
}> = ({ operation }) => {
  const { control } = useForm<CopilotDocV1.Operation>({
    defaultValues: operation,
  });

  return (
    <section className="py-4 px-8 flex flex-col overflow-auto relative">
      <div className="-mx-8 -mt-4 mb-8 px-8 py-2 text-lg font-medium flex items-center bg-slate-100 shadow">
        <Icon icon="document" />
        <span className="ml-2 mr-4">MAA Copilot 作业编辑器</span>
        <Icon icon="saved" size={14} className="text-gray-600 font-normal" />
        <span className="ml-1 text-sm text-gray-600 font-normal">
          {formatRelativeTime(Date.now())} 已自动保存
        </span>

        <div className="flex-1"></div>

        <Button intent="primary" className="ml-4" icon="upload" text="发布" />
      </div>

      <H4>作业元信息</H4>
      <div className="flex">
        <div className="w-1/4 mr-8">
          <FormField
            label="关卡名"
            field="stageName"
            control={control}
            FormGroupProps={{ helperText: "除危机合约外，均请填写关卡中文名" }}
            ControllerProps={{
              render: ({ field }) => (
                <InputGroup
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
          <Card className="h-[30rem]"></Card>
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
    </section>
  );
};
