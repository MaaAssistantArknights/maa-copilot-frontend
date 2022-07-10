import { FC, memo } from 'react'

export const Paragraphs: FC<{ content?: string }> = memo(({ content }) => {
  const paragraphs = content?.split('\n').map((el) => el.trim())
  return (
    <>
      {paragraphs?.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  )
})
