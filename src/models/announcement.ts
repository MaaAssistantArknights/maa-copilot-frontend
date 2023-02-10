import { chunk, compact } from 'lodash-es'

export interface Announcement {
  sections: AnnouncementSection[]
  raw: string
}

export interface AnnouncementSection {
  raw: string
  title: string
  meta?: AnnouncementSectionMeta
}

export interface AnnouncementSectionMeta
  extends Omit<Required<AnnouncementSectionMetaRaw>, 'time'> {
  time: Date
}

export interface AnnouncementSectionMetaRaw {
  time?: string | number
  level?: 'verbose' | 'info' | 'warning'
}

export function parseAnnouncement(raw: string): Announcement {
  // remove HTML comments:
  // actually there is a way to hide comments in react-markdown
  // (https://github.com/remarkjs/react-markdown#appendix-a-html-in-markdown)
  // but that can be dangerous, so we simply remove the comments
  raw = raw.replace(/<!--[\s\S]*?-->/g, '')

  // a section starts with an arbitrary level of heading
  const sectionSeparator = /^(#+)/m

  // will be like: ["###", "Section 1\nContent", "###", "Section 2\nContent", ...]
  const slices = raw
    .split(sectionSeparator)
    // ignore everything before the first heading, which is typically empty lines
    .slice(1)

  const rawSections = chunk(slices, 2).map(
    ([headingMarks, rest]) => headingMarks + rest,
  )

  const sections: (AnnouncementSection | undefined)[] = rawSections.map(
    (rawSection) => {
      try {
        const emptyLinesMatcher = /^(\s*\n)+/m
        const slices = rawSection.split(emptyLinesMatcher)
        const segments = compact(slices.map((s) => s.trim())) // remove the matched empty lines

        const title = segments[0]?.replace(/^#+/, '').trim() || 'No title'
        const meta = segments[1] ? parseSectionMeta(segments[1]) : undefined

        if (meta) {
          rawSection = rawSection.replace(segments[1], '')
        }

        return {
          title,
          meta,
          raw: rawSection,
        }
      } catch (e) {
        console.warn(e)
        return undefined
      }
    },
  )

  return {
    sections: compact(sections),
    raw,
  }
}

function parseSectionMeta(segment: string) {
  const jsonBlockStart = '```json'
  const jsonBlockEnd = '```'

  try {
    if (segment.startsWith(jsonBlockStart)) {
      const rawMeta = JSON.parse(
        segment.slice(jsonBlockStart.length, -jsonBlockEnd.length),
      ) as AnnouncementSectionMetaRaw

      let time: Date

      try {
        time = new Date(rawMeta.time || 0)
      } catch (e) {
        time = new Date(0)
        console.warn(e)
      }

      return {
        time,
        level: rawMeta.level || 'info',
      }
    }
  } catch (e) {
    console.warn(e)
  }

  return undefined
}
