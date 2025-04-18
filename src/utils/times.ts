import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import i18n from 'i18next'

dayjs.extend(relativeTime)

function updateDayjsLocale() {
  dayjs.locale(i18n.language === 'cn' ? 'zh-cn' : 'en')
}

updateDayjsLocale()

i18n.on('languageChanged', updateDayjsLocale)

export type DayjsInput = string | number | dayjs.Dayjs | Date | null | undefined

export function formatRelativeTime(input: DayjsInput) {
  input = dayjs(input)
  return +input > +dayjs() ? input.toNow() : input.fromNow()
}

export function formatDateTime(input: DayjsInput) {
  return dayjs(input).format('YYYY-MM-DD HH:mm:ss')
}

export function formatDuration(milliseconds: number) {
  const hours = ~~(milliseconds / (60 * 60 * 1000))

  milliseconds -= hours * 60 * 60 * 1000

  const minutes = ~~(milliseconds / (60 * 1000))

  milliseconds -= minutes * 60 * 1000

  const seconds = ~~(milliseconds / 1000)

  milliseconds -= seconds * 1000

  if (hours > 0) {
    return `${hours}h${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m${seconds}s`
  } else if (seconds > 0) {
    return `${seconds + milliseconds / 1000}s`
  } else {
    return `${milliseconds}ms`
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)

  // Get components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Format as YYYY-MM-DD HH:MM:SS for both languages
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
