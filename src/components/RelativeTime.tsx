import { Tooltip2, Tooltip2Props } from '@blueprintjs/popover2'
import { FC, memo, useEffect, useMemo, useState } from 'react'
import { formatDateTime, formatRelativeTime } from 'utils/times'
import { DayjsInput } from 'utils/times'

export const RelativeTime: FC<{
  moment: DayjsInput
  className?: string
  detailTooltip?: boolean
  Tooltip2Props?: Omit<Tooltip2Props, 'content'>
}> = memo(({ moment, className, detailTooltip = true, Tooltip2Props }) => {
  const [formatted, setFormatted] = useState(formatRelativeTime(moment))

  useEffect(() => {
    const interval = setInterval(() => {
      setFormatted(formatRelativeTime(moment))
    }, 5000)

    return () => clearInterval(interval)
  }, [moment])

  const absoluteTime = useMemo(() => {
    return formatDateTime(moment)
  }, [moment])

  const child = useMemo(
    () => <span className={className}>{formatted}</span>,
    [formatted, className],
  )

  return detailTooltip ? (
    <Tooltip2 {...Tooltip2Props} content={absoluteTime}>
      {child}
    </Tooltip2>
  ) : (
    child
  )
})
