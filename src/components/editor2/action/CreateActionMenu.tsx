import { Icon, Menu, MenuDivider, MenuItem, mergeRefs } from '@blueprintjs/core'
import {
  Popover2,
  Popover2Props,
  PopperCustomModifer,
  Tooltip2,
} from '@blueprintjs/popover2'

import { clamp } from 'lodash-es'
import { FC, ReactNode, Ref, useRef } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ACTION_TYPES_BY_GROUP } from '../../../models/types'
import { joinJSX } from '../../../utils/react'
import { EditorFormValues, useEditorControls } from '../editor-state'
import { createAction } from '../reconciliation'

interface CreateActionMenuProps {
  index?: number
  renderTarget?: (
    props: { locatorRef: Ref<HTMLElement> } & Parameters<
      NonNullable<Popover2Props['renderTarget']>
    >[0],
  ) => JSX.Element
  children?: ReactNode
}

export const CreateActionMenu: FC<CreateActionMenuProps> = ({
  index,
  renderTarget,
  children,
}) => {
  const { checkpoint } = useEditorControls()
  const { control } = useFormContext<EditorFormValues>()
  const { append, insert } = useFieldArray({ name: 'actions', control })
  const containerRef = useRef<HTMLElement>(null)
  const locatorRef = useRef<HTMLElement>(null)
  const popperRef =
    useRef<Parameters<NonNullable<PopperCustomModifer['fn']>>[0]['instance']>()
  return (
    <Popover2
      minimal
      placement="right-start"
      popoverClassName="[&>.bp4-popover2-content]:!p-0 overflow-hidden"
      content={
        <Menu>
          {joinJSX(
            Object.values(ACTION_TYPES_BY_GROUP).map((actionTypes) =>
              actionTypes.map(({ title, description, icon, value }) => (
                <MenuItem
                  key={value}
                  icon={icon}
                  text={title}
                  labelElement={
                    <Tooltip2 content={description}>
                      <Icon
                        className="!text-gray-300 dark:!text-gray-500"
                        icon="info-sign"
                      />
                    </Tooltip2>
                  }
                  onClick={() => {
                    checkpoint('add-action', '添加动作', true)
                    const newAction = createAction(value)
                    if (index !== undefined) {
                      insert(index, newAction)
                    } else {
                      append(newAction)
                    }
                  }}
                />
              )),
            ),
            <MenuDivider />,
          ).flat()}
        </Menu>
      }
      modifiersCustom={
        renderTarget
          ? [
              {
                name: 'getPopperInstance',
                enabled: true,
                phase: 'main',
                fn: ({ instance }) => void (popperRef.current = instance),
              },
            ]
          : undefined
      }
      renderTarget={
        renderTarget &&
        (({ ref, onClick, ...props }) =>
          renderTarget({
            ...props,
            ref: containerRef,
            locatorRef: mergeRefs(locatorRef, ref),
            onClick: (e) => {
              const locator = locatorRef.current
              const container = containerRef.current
              if (!locator || !container || !onClick) {
                return
              }
              const rect = container.getBoundingClientRect()
              const top = clamp(e.clientY - rect.top, 0, rect.height)
              const left = clamp(e.clientX - rect.left, 0, rect.width)
              locator.style.top = `${top}px`
              locator.style.left = `${left}px`
              onClick(e)
              // 如果在 Popover 已经是打开状态时再次点击，会关闭并立刻再打开，而由于 Popover 内部的动画机制，
              // 在关闭后 300ms 内打开会导致 Popper 不更新位置，所以这里必须手动更新
              popperRef.current?.update()
            },
          }))
      }
    >
      {children}
    </Popover2>
  )
}
