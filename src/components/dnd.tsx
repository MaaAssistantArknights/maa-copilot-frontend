import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { FC, ReactNode } from 'react'

export type SortableItemProps = ReturnType<typeof useSortable>

export interface SortableProps {
  id: UniqueIdentifier
  data?: Record<string, any>
  className?: string
  children: ReactNode | ((childProps: SortableItemProps) => ReactNode)
}

export const Sortable: FC<SortableProps> = ({
  id,
  data,
  className,
  children,
}) => {
  const sortable = useSortable({
    id,
    data,
    transition: {
      duration: 250, // milliseconds
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const { attributes, listeners, setNodeRef, transform, transition } = sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (typeof children === 'function') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={clsx('relative', className)}
      >
        {children(sortable)}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={clsx('relative', className)}
    >
      {children}
    </div>
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
