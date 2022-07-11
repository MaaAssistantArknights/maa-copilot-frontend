import { Button, Card } from '@blueprintjs/core'
import { DevTool } from '@hookform/devtools'
import { CardTitle } from 'components/CardTitle'
import {
  EditorActionExecPredicateCostChange,
  EditorActionExecPredicateKills,
} from 'components/editor/action/EditorActionExecPredicate'
import { EditorActionOperatorDirection } from 'components/editor/action/EditorActionOperatorDirection'
import { EditorActionOperatorLocation } from 'components/editor/action/EditorActionOperatorLocation'
import { EditorActionTypeSelect } from 'components/editor/action/EditorActionTypeSelect'
import { FormField2 } from 'components/FormField'
import { SubmitHandler, UseFieldArrayAppend, useForm } from 'react-hook-form'
import { EditorResetButton } from 'components/editor/EditorResetButton'

export interface EditorActionAddProps {
  append: UseFieldArrayAppend<CopilotDocV1.Action>
}

export const EditorActionAdd = ({ append }: EditorActionAddProps) => {
  const {
    control,
    reset,
    getValues,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<CopilotDocV1.Action>()

  const onSubmit: SubmitHandler<CopilotDocV1.Action> = (values) => {
    append(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-8">
        <div className="flex items-center mb-4">
          <CardTitle className="mb-0" icon="add">
            <span>添加动作</span>
          </CardTitle>

          <div className="flex-1" />

          <EditorResetButton<CopilotDocV1.Action>
            reset={reset}
            entityName="动作"
          />
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
            className="mr-4"
          >
            <EditorActionOperatorLocation<CopilotDocV1.Action>
              control={control}
              name="location"
              getValues={getValues}
            />
          </FormField2>

          <FormField2
            label="干员朝向"
            field="direction"
            error={errors.direction}
            description="部署干员的干员朝向"
          >
            <EditorActionOperatorDirection<CopilotDocV1.Action>
              control={control}
              name="direction"
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
  )
}
