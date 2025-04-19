import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  NonIdealState,
} from '@blueprintjs/core'

import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Components } from 'react-markdown'

import { announcementBaseURL } from '../../apis/announcement'
import {
  AnnouncementSection,
  AnnouncementSectionMeta,
} from '../../models/announcement'
import { formatDateTime, formatRelativeTime } from '../../utils/times'
import { Markdown } from '../Markdown'

interface AnnDialogProps extends DialogProps {
  sections?: AnnouncementSection[]
}

export const AnnDialog: FC<AnnDialogProps> = ({ sections, ...dialogProps }) => {
  const { t } = useTranslation()
  const content = sections?.map(({ raw }) => raw).join('\n\n')

  // attach each section's meta to its heading node
  const attachMetaPlugin = () => {
    // https://github.com/remarkjs/remark#what-is-this
    // the tree's type definition is not exported, if you want to know, log it to console
    return (tree: any) => {
      let headingIndex = 0

      tree.children.forEach((node: any) => {
        if (node.type === 'element' && node.tagName.match(/^h[1-6]$/)) {
          const section = sections?.[headingIndex]

          if (section && !node._meta) {
            node._meta = section.meta
            headingIndex++
          }
        }
      })
    }
  }

  const Heading: Components['h1'] = ({ level, node, children, ...props }) => {
    const Tag = node.tagName as HTMLHeadingElement['tagName']
    const meta = (node as any)._meta as AnnouncementSectionMeta | undefined

    return (
      <Tag {...props}>
        {children}
        {meta?.time && (
          <span
            className="ml-2 font-normal text-sm whitespace-nowrap text-gray-500"
            title={formatDateTime(meta.time)}
          >
            {formatRelativeTime(meta.time)}
          </span>
        )}
      </Tag>
    )
  }

  return (
    <Dialog
      className=""
      title={t('components.announcement.AnnDialog.title')}
      icon="info-sign"
      {...dialogProps}
    >
      <DialogBody className="">
        {content ? (
          <Markdown
            rehypePlugins={[attachMetaPlugin]}
            components={{
              h1: Heading,
              h2: Heading,
              h3: Heading,
              h4: Heading,
              h5: Heading,
              h6: Heading,
            }}
            transformLinkUri={transformUri}
            transformImageUri={transformUri}
          >
            {content || ''}
          </Markdown>
        ) : (
          <NonIdealState
            icon="help"
            title={t('components.announcement.AnnDialog.no_announcements')}
          />
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            intent="primary"
            text={t('components.announcement.AnnDialog.ok')}
            onClick={dialogProps.onClose}
          />
        }
      />
    </Dialog>
  )
}

function transformUri(href: string) {
  try {
    return new URL(href, announcementBaseURL).href
  } catch (e) {
    console.warn(e)
    return href
  }
}
