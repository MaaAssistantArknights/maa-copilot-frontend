import useSWR from 'swr'

import mockFile from './mock/announcements.md?url'

const isMock = process.env.NODE_ENV === 'development'

const announcementURL = isMock
  ? mockFile
  : 'https://ota.maa.plus/MaaAssistantArknights/api/announcements/copilot.md'

export const announcementBaseURL = isMock
  ? location.href
  : announcementURL.slice(0, announcementURL.lastIndexOf('/') + 1)

export function useAnnouncement() {
  return useSWR<string>(
    announcementURL,
    (url) =>
      fetch(url)
        .then((res) => res.text())
        .catch((e) => {
          if ((e as Error).message === 'Failed to fetch') {
            throw new Error('网络错误')
          }

          throw e
        }),
    {
      refreshInterval: 1000 * 60 * 60,
    },
  )
}
