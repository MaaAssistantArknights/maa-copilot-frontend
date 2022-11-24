import { Card, Collapse, Elevation } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, ReactNode } from 'react'

interface ExpandableCardProps {
  className?: string
  expand: boolean
  setExpand: (open: boolean) => void
  content?: ReactNode | ((open: boolean) => ReactNode)
  children: ReactNode | ((open: boolean) => ReactNode)
}

export const ExpandableCard: FC<ExpandableCardProps> = ({
  className,
  expand,
  setExpand,
  content,
  children,
}) => {
  return (
    <Card
      elevation={expand ? Elevation.THREE : Elevation.TWO}
      className={clsx(
        '!p-0 overflow-hidden',
        expand && 'bg-slate-100',
        className,
      )}
    >
      <div
        className={clsx(
          'p-4 cursor-pointer transition-colors',
          expand
            ? 'hover:bg-gray-200 active:bg-gray-300 border-b border-slate-300'
            : 'hover:bg-gray-100 active:bg-gray-200',
        )}
        onClick={() => setExpand(!expand)}
        // prevent double click to select text
        onMouseDown={(e) => e.preventDefault()}
        // a11y
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setExpand(!expand)
          }
        }}
      >
        {typeof children === 'function' ? children(expand) : children}
      </div>

      <Collapse isOpen={expand} transitionDuration={100}>
        <div className="p-4">
          {typeof content === 'function' ? content(expand) : content}
        </div>
      </Collapse>
    </Card>
  )
}
