import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  NonIdealState,
} from '@blueprintjs/core'

import { FC } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { announcementBaseURL } from '../../apis/announcement'
import {
  AnnouncementSection,
  AnnouncementSectionMeta,
} from '../../models/announcement'
import { formatDateTime, formatRelativeTime } from '../../utils/times'

interface AnnDialogProps extends DialogProps {
  sections?: AnnouncementSection[]
}

export const AnnDialog: FC<AnnDialogProps> = ({ sections, ...dialogProps }) => {
  const content = sections?.map(({ raw }) => raw).join('\n\n')

  // attach meta to heading node
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
      title="公告"
      icon="info-sign"
      canOutsideClickClose={false}
      {...dialogProps}
    >
      <DialogBody className="">
        {content ? (
          <ReactMarkdown
            className="markdown-body !text-sm !bg-transparent [&_img]:!bg-transparent"
            remarkPlugins={[remarkGfm]}
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
          </ReactMarkdown>
        ) : (
          <NonIdealState icon="help" title="没有公告" />
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <Button intent="primary" text="确定" onClick={dialogProps.onClose} />
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
