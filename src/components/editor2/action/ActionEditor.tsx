import { Button, Divider, Icon, NonIdealState } from '@blueprintjs/core'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import clsx from 'clsx'
import { uniqueId, unset } from 'lodash-es'
import { FC } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Sortable, useStableArray } from '../../dnd'
import { EditorFormValues, useEditorControls } from '../editor-state'
import { getInternalId } from '../reconciliation'
import { ActionItem } from './ActionItem'
import { CreateActionMenu } from './CreateActionMenu'
import { LevelMap } from './LevelMap'

interface ActionEditorProps {
  className?: string
}

export const ActionEditor: FC<ActionEditorProps> = ({ className }) => {
  const { checkpoint } = useEditorControls()
  const { control } = useFormContext<EditorFormValues>()
  const {
    fields: actionDefaults,
    append,
    insert,
    update,
    move,
    remove,
  } = useFieldArray({
    name: 'actions',
    control,
  })
  const sensors = useSensors(useSensor(PointerSensor))
  const actionIds = useStableArray(actionDefaults.map(getInternalId))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = actionDefaults.findIndex(
        (el) => getInternalId(el) === active.id,
      )
      const newIndex = actionDefaults.findIndex(
        (el) => getInternalId(el) === over.id,
      )
      if (oldIndex !== -1 && newIndex !== -1) {
        checkpoint(`move-action-${oldIndex}-${newIndex}`, '移动动作', true)
        move(oldIndex, newIndex)
      }
    }
  }

  const handleDuplicate = (index: number) => {
    const action = JSON.parse(JSON.stringify(actionDefaults[index]))
    action._id = uniqueId()
    unset(action, 'id')
    insert(index + 1, action)
  }

  return (
    <div className={clsx('grow min-h-0 flex', className)}>
      <div className="flex-1">
        <div className="h-[400px]">
          <LevelMap className="h-full" />
        </div>
      </div>
      <Divider className="m-0" />
      <div className="flex-1 p-4 pr-8 pb-96 overflow-auto">
        <div className="flex items-center">
          <h3 className="text-xl font-bold">动作序列</h3>
          <Divider className="grow" />
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={actionIds}>
            <ul className="flex flex-col">
              {actionDefaults.map((action, index) => (
                <Sortable
                  id={getInternalId(action)}
                  // key 必须和 index 绑定，不然插入动作时会数据错乱，因为 RHF Controller 内部有缓存。
                  // 按照 RHF 官方文档的方案应该是用 key={action.id}，但这个 id 很不稳定，动不动就更新，
                  // 导致填写 input 的时候丢失 focus，所以这里用我们自己的 internal id 加 index
                  key={getInternalId(action) + index}
                >
                  {(attrs) => (
                    <ActionItem
                      onDuplicate={() => handleDuplicate(index)}
                      onRemove={() => remove(index)}
                      {...attrs}
                      index={index}
                    />
                  )}
                </Sortable>
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <CreateActionMenu
          renderTarget={({ ref, locatorRef, onClick }) => (
            <Button
              minimal
              outlined
              icon={<Icon icon="plus" size={24} />}
              intent="primary"
              className="relative mt-6 w-full h-16 !text-xl"
              elementRef={ref}
              onClick={onClick}
            >
              <span className="absolute pointer-events-none" ref={locatorRef} />
              添加动作
            </Button>
          )}
        />

        {actionDefaults.length === 0 && (
          <NonIdealState title="暂无动作" className="" icon="inbox" />
        )}
      </div>
    </div>
  )
}
