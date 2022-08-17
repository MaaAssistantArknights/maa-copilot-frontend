import Linkify from 'linkify-react'
import { FC, memo } from 'react'

export const Paragraphs: FC<{ content?: string; linkify?: boolean }> = memo(
  ({ content, linkify }) => {
    const paragraphs = content?.split('\n').map((el) => el.trim())
    const child = (
      <>
        {paragraphs?.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </>
    )

    return linkify ? (
      <Linkify
        options={{
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          className: 'break-all',
          format: {
            url: (value) =>
              value.length > 50 ? value.slice(0, 50) + '…' : value,
          },
        }}
      >
        {child}
      </Linkify>
    ) : (
      child
    )
  },
)

Paragraphs.displayName = 'Paragraphs'
