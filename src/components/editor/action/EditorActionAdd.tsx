import { Alert, Button, Card, H4 } from "@blueprintjs/core";
import { DevTool } from "@hookform/devtools";
import { CardTitle } from "components/CardTitle";
import { copilotSchemaValidator } from "models/copilot.schema.validator";
import { FC, useEffect, useState } from "react";
import { useForm, UseFormReset } from "react-hook-form";
import {
  EditorActionExecPredicateCostChange,
  EditorActionExecPredicateKills
} from "src/components/editor/action/EditorActionExecPredicate";
import { EditorActionLocation } from "src/components/editor/action/EditorActionLocation";
import { EditorActionTypeSelect } from "src/components/editor/action/EditorActionTypeSelect";
import { FormField2 } from "../../FormField";

export const EditorActionAdd: FC = () => {
  const {
    control,
    watch,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Action>();

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log(value, name, type);

      const validate = copilotSchemaValidator.getSchema(
        "copilot#/properties/actions/items"
      );
      if (!validate) return;

      const valid = validate(value);
      console.log("validation", valid, validate.errors);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (val: CopilotDocV1.Action) => {
    console.log(val);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mt-4 mb-8">
        <div className="flex items-center mb-4">
          <CardTitle className="mb-0" icon="add">
            <span>添加动作</span>
          </CardTitle>

          <div className="flex-1" />

          <EditorResetButton reset={reset} />
        </div>

        <DevTool control={control} />

        <div className="flex flex-col lg:flex-row">
          <div className="flex flex-1">
            <FormField2
              label="动作类型"
              field="type"
              error={errors.type}
              asterisk
            >
              <EditorActionTypeSelect<CopilotDocV1.Action>
                control={control}
                name="type"
              />
            </FormField2>
          </div>

          <div className="flex">
            <FormField2
              label="击杀数条件"
              className="mr-2 lg:mr-4"
              field="kills"
              error={errors.kills}
              description="击杀数条件，如果没达到就一直等待。可选，默认为 0，直接执行"
            >
              <EditorActionExecPredicateKills<CopilotDocV1.Action>
                name="kills"
                control={control}
              />
            </FormField2>

            <FormField2
              label="费用变化量条件"
              field="costChanges"
              error={errors.costChanges}
              description="费用变化量，如果没达到就一直等待。可选，默认为 0，直接执行。注意：费用变化量是从开始执行本动作时开始计算的（即：使用前一个动作结束时的费用作为基准）；另外仅在费用是两位数的时候识别的比较准，三位数的费用可能会识别错，不推荐使用"
            >
              <EditorActionExecPredicateCostChange<CopilotDocV1.Action>
                name="costChanges"
                control={control}
              />
            </FormField2>
          </div>
        </div>

        <div className="flex">
          <FormField2
            label="干员位置"
            field="location"
            error={errors.location}
            description="填完关卡名后开一局，会在目录下 map 文件夹中生成地图坐标图片"
          >
            <EditorActionLocation<CopilotDocV1.Action>
              control={control}
              name="location"
              getValues={getValues}
            />
          </FormField2>
        </div>

        <Button
          disabled={!isValid && !isDirty}
          intent="primary"
          type="submit"
          icon="add"
        >
          添加
        </Button>
      </Card>
    </form>
  );
};

const EditorResetButton = <T,>({
  reset,
}: {
  reset: UseFormReset<CopilotDocV1.Action>;
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  return (
    <>
      <Alert
        isOpen={resetDialogOpen}
        confirmButtonText="重置"
        cancelButtonText="取消"
        icon="reset"
        intent="danger"
        canOutsideClickCancel
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          reset();
          setResetDialogOpen(false);
        }}
      >
        <H4>重置动作</H4>
        <p>确定要重置动作吗？</p>
      </Alert>

      <Button
        className="ml-4"
        icon="reset"
        minimal
        intent="danger"
        onClick={() => setResetDialogOpen(true)}
      >
        重置...
      </Button>
    </>
  );
};
