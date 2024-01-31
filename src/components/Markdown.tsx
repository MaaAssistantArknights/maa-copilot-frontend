import clsx from 'clsx'
import { uniq } from 'lodash-es'
import ReactMarkdown from 'react-markdown'
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

interface MarkdownProps extends ReactMarkdownOptions {
  className?: string
}

export function Markdown({
  className,
  remarkPlugins,
  components,
  children,
  ...props
}: MarkdownProps) {
  return (
    <ReactMarkdown
      className={clsx(
        className,
        'markdown-body !text-sm !bg-transparent [&_img]:!bg-transparent',
      )}
      remarkPlugins={uniq([remarkGfm, remarkBreaks, ...(remarkPlugins ?? [])])}
      components={{
        ...components,

        a: ({ node, children, ...props }) => {
          // set target="_blank" for external links, see: https://github.com/remarkjs/react-markdown/issues/12#issuecomment-1479195975
          if (props.href?.startsWith('http')) {
            props.target = '_blank'
            props.rel = 'noopener noreferrer'
          }

          // by default, ReactMarkdown already handles dangerous URIs and replaces them with "javascript:void(0)",
          // but React warns about passing such a string to the href, so we'll handle this
          if (props.href?.startsWith('javascript:')) {
            props.href = '#'
            props.onClick = (e) => e.preventDefault()
          }

          return <a {...props}>{children}</a>
        },
      }}
      {...props}
    >
      {children}
    </ReactMarkdown>
  )
}
