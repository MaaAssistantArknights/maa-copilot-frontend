import { H2 } from '@blueprintjs/core'

import { Markdown } from 'components/Markdown'

// eslint-disable-next-line import/no-unresolved
import changelog from '../../CHANGELOG.md?raw'

export const AboutPage = () => {
  return (
    <div className="max-w-[48rem] mx-auto">
      <div className="mt-8 flex flex-col items-center">
        <div className="">
          <div className="bg-rainbow relative !text-transparent !bg-clip-text font-bold italic text-7xl leading-[1.2]">
            <div className="ml-48 text-6xl !text-inherit">作业站解君愁</div>
            <div className="mr-48 !text-inherit">点击收藏不迷路</div>
          </div>
          <div className="bg-rainbow !bg-clip-content h-1.5 pr-48" />
        </div>
      </div>

      <div className="mt-16">
        <H2>更新日志</H2>
        <Markdown>{changelog}</Markdown>
      </div>
    </div>
  )
}
