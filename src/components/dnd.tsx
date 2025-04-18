import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { isEqual } from 'lodash-es'
import { FC, ReactNode, useRef } from 'react'

export type SortableItemProps = ReturnType<typeof useSortable>

export interface SortableProps {
  id: UniqueIdentifier
  data?: Record<string, any>
  noSortAnimation?: boolean
  className?: string
  children: ReactNode | ((childProps: SortableItemProps) => ReactNode)
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  if (args.isSorting) {
    return defaultAnimateLayoutChanges(args)
  }
  // 启用 noSortAnimation 时，这里要返回 true 才能在排序结束时触发动画
  return true
}

export const Sortable: FC<SortableProps> = ({
  id,
  data,
  noSortAnimation,
  className,
  children,
}) => {
  const sortable = useSortable({
    id,
    data,
    animateLayoutChanges: noSortAnimation ? animateLayoutChanges : undefined,
  })

  const {
    isSorting,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortable

  const style = {
    transform:
      isSorting && noSortAnimation
        ? undefined
        : CSS.Transform.toString(
            transform && { ...transform, scaleY: 1, scaleX: 1 },
          ),
    transition,
  }

  if (typeof children === 'function') {
    return (
      <li ref={setNodeRef} style={style} className={className}>
        {children(sortable)}
      </li>
    )
  }

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={className}
    >
      {children}
    </li>
  )
}

export type DroppableItemProps = ReturnType<typeof useDroppable>

export interface DroppableProps {
  id: UniqueIdentifier
  data?: Record<string, any>
  children: ReactNode | ((childProps: DroppableItemProps) => ReactNode)
}

export const Droppable: FC<DroppableProps> = ({ id, data, children }) => {
  const droppable = useDroppable({ id, data })

  const { setNodeRef } = droppable

  if (typeof children === 'function') {
    return <div ref={setNodeRef}>{children(droppable)}</div>
  }

  return <div ref={setNodeRef}>{children}</div>
}

// 启用 noSortAnimation 时，要尽可能把静态的 items 数组传给 SortableContext，不然无法触发排序动画
export function useStableArray<T>(array: T[]): T[] {
  const previousArray = useRef<T[]>(array)
  if (!isEqual(previousArray.current, array)) {
    previousArray.current = array
  }
  return previousArray.current
}
