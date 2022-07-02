import { Button, ButtonGroup, Card, FormGroup, Tag } from "@blueprintjs/core";
import { Suggest2 } from "@blueprintjs/select";
import { CardTitle } from "components/CardTitle";
import { OperationList } from "components/OperationList";
import { FC } from "react";
import { withSuspensable } from "./Suspensable";

export const Operations: FC = withSuspensable(() => {
  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle icon="properties">查找作业</CardTitle>
        <FormGroup label="搜索" helperText="键入关卡名" className="mt-2">
          <Suggest2
            className="w-1/3"
            inputProps={{
              placeholder: "搜索...",
              leftIcon: "search",
              size: 64,
              large: true,
              enterKeyHint: "search",
              // rightElement: <Spinner size={18} />,
            }}
            items={[]}
          />
        </FormGroup>
        <FormGroup label="排序">
          <ButtonGroup>
            <Button active icon="thumbs-up">
              <span className="flex items-center">
                好评率优先
                <Tag minimal className="ml-1">
                  默认
                </Tag>
              </span>
            </Button>
            <Button icon="time">最近发布优先</Button>
          </ButtonGroup>
        </FormGroup>
      </Card>

      <OperationList />
    </>
  );
});
