import { H2 } from '@blueprintjs/core'

import { Markdown } from 'components/Markdown'

import changelog from '../../CHANGELOG.md?raw'

export const AboutPage = () => {
  return (
    <div className="max-w-screen-md mx-auto">
      <div className="mt-8 flex flex-col items-center">
        <div className="text-[2rem] md:text-[3.75rem]">
          <div className="bg-rainbow relative !text-transparent !bg-clip-text font-bold italic leading-[1.2]">
            <div className="ml-[3.2em] mr-[0.2em] !text-inherit">
              作业站解君愁
            </div>
            <div className="text-[1.2em] !text-inherit">点个收藏不迷路</div>
          </div>
          <div className="bg-rainbow !bg-clip-content h-[0.1em] pr-[1em]" />
        </div>
      </div>

      <div className="mt-12 p-4">
        <H2>更新日志</H2>
        <Markdown>{changelog}</Markdown>
      </div>
    </div>
  )
}
