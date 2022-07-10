import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export type DayjsInput = string | number | dayjs.Dayjs | Date | null | undefined

export function formatRelativeTime(input: DayjsInput) {
  return dayjs(input).fromNow()
}

export function formatDateTime(input: DayjsInput) {
  return dayjs(input).format('YYYY-MM-DD HH:mm:ss')
}

export function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m${seconds}s`
  } else {
    return `${seconds}s`
  }
}
