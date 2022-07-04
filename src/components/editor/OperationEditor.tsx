import {
  Button,
  Card,
  Elevation,
  H4,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
  TextArea
} from "@blueprintjs/core";
import { ContextMenu2 } from "@blueprintjs/popover2";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "src/components/FormField";
import { formatRelativeTime } from "utils/times";
import { EditorActionAdd } from "./action/EditorActionAdd";

export const OperationEditor: FC<{
  operation?: CopilotDocV1.Operation;
}> = ({ operation }) => {
  const { control, watch } = useForm<CopilotDocV1.Operation>({
    defaultValues: operation,
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(name, type, value)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

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
          <Card className="h-[30rem]"></Card>
        </div>
        <div className="w-2/3">
          <H4>动作序列</H4>
          <div className="flex text-gray-600 text-xs items-center mb-2">
            <Icon icon="help" size={12} className="mr-1.5" />
            <span>拖拽以重新排序</span>
            <span className="mx-0.5">·</span>
            <span>右键以展开上下文菜单</span>
          </div>
          <EditorActions />
        </div>
      </div>
    </section>
  );
};

export const EditorActions: FC = () => {
  const [cards, setCards] = useState<UniqueIdentifier[]>(
    Array.from({ length: 0 }, (_, i) => i.toString())
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  console.log(cards);

  return (
    <div className="flex flex-col h-full">
      <div className="h-full overflow-auto p-2 -mx-2 relative">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={cards} strategy={verticalListSortingStrategy}>
            {cards.map((cardId) => (
              <EditorActionItem
                key={cardId}
                id={cardId}
                title={cardId as string}
              />
            ))}
          </SortableContext>
        </DndContext>

        {cards.length === 0 && <NonIdealState title="暂无动作" icon="inbox" />}
      </div>

      <EditorActionAdd />
    </div>
  );
};

export const EditorActionItem: FC<{
  id: UniqueIdentifier;
  title: string;
}> = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ContextMenu2
      className="mb-2 last:mb-0"
      content={
        <Menu>
          <MenuItem text="编辑动作" icon="edit" />
          <MenuItem intent="danger" text="删除动作..." icon="delete" />
        </Menu>
      }
    >
      <div style={style} ref={setNodeRef}>
        <Card elevation={Elevation.TWO}>
          <Icon
            className="cursor-grab active:cursor-grabbing py-1 px-0.5 -my-1 -mx-0.5 rounded-[1px]"
            icon="drag-handle-vertical"
            {...attributes}
            {...listeners}
          />
          <span className="ml-4">{id}</span>
        </Card>
      </div>
    </ContextMenu2>
  );
};
