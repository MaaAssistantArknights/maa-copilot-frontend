import { Card, Icon } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, useEffect, useMemo, useState } from 'react'

import { useAnnouncement } from '../../apis/announcement'
import {
  AnnouncementSection,
  parseAnnouncement,
} from '../../models/announcement'
import { useLazyStorage } from '../../utils/useLazyStorage'
import { CardTitle } from '../CardTitle'
import { AnnDialog } from './AnnDialog'

interface AnnPanelProps {
  className?: string
}

export const AnnPanel: FC<AnnPanelProps> = ({ className }) => {
  const { data } = useAnnouncement()
  const announcement = useMemo(
    () => (data ? parseAnnouncement(data) : undefined),
    [data],
  )
  const [lastNoticed, setLastNoticed] = useLazyStorage(
    'copilot-last-noticed',
    Date.now(),
  )
  const [displaySections, setDisplaySections] =
    useState<AnnouncementSection[]>()

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const freshSections = announcement?.sections.filter(
      ({ meta: { time, level } = {} }) =>
        level !== 'verbose' && +(time || 0) > lastNoticed,
    )

    if (freshSections?.length) {
      setIsOpen(true)
      setDisplaySections(freshSections)
      setLastNoticed(Date.now())
    }
  }, [announcement])

  return (
    <>
      <Card
        interactive
        className={clsx(className)}
        onClick={() => {
          setIsOpen(true)
          setDisplaySections(announcement?.sections)
        }}
      >
        <CardTitle icon="info-sign">公告</CardTitle>

        <div className="flex">
          <ul className="grow list-disc pl-4">
            {announcement?.sections.slice(0, 3).map(({ title }) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
          <Icon className="self-end" icon="more" size={14} />
        </div>
      </Card>
      <AnnDialog
        sections={displaySections}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
