import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

type DayjsInput = string | number | dayjs.Dayjs | Date | null | undefined

export function formatRelativeTime(input: DayjsInput) {
  return dayjs(input).fromNow()
}

export function formatDateTime(input: DayjsInput) {
  return dayjs(input).format('YYYY-MM-DD HH:mm:ss')
}
