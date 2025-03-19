import { Card } from '@blueprintjs/core'

import dayjs from 'dayjs'
import { ComponentType } from 'react'

import { CardTitle } from 'components/CardTitle'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { Operations } from 'components/Operations'
import { OperationDrawer } from 'components/drawer/OperationDrawer'
import { OperationEditorLauncher } from 'components/editor/OperationEditorLauncher'
import { OperationSetEditorLauncher } from 'components/operation-set/OperationSetEditor'
import { OperationUploaderLauncher } from 'components/uploader/OperationUploaderLauncher'

import { AnnPanel } from '../components/announcement/AnnPanel'
import { SOCIAL_LINKS } from '../links'
import { useCurrentSize } from '../utils/useCurrenSize'

export const IndexPage: ComponentType = withGlobalErrorBoundary(() => {
  const { isMD } = useCurrentSize()
  return (
    <div className="flex flex-col md:flex-row px-4 mt-4 md:px-8 md:mt-8 max-w-[96rem] mx-auto">
      {isMD && <Ads />}
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8 mt-4 md:mt-0">
        <Operations />
      </div>
      {!isMD && (
        <div className="md:w-1/3 order-1 md:order-2">
          <div className="sticky top-20">
            <Card className="flex flex-col mb-4 space-y-2">
              <CardTitle icon="add" className="mb-4">
                创建新作业
              </CardTitle>

              <OperationEditorLauncher />
              <OperationUploaderLauncher />
              <OperationSetEditorLauncher />
            </Card>

            <AnnPanel className="mb-4" />

            <div className="flex flex-wrap leading-relaxed mb-4 section-social-links">
              {SOCIAL_LINKS.map((link) => (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-zinc-600 dark:text-slate-100 no-underline"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              )).reduce((prev, curr) => (
                <>
                  {prev}
                  <div className="mx-2 opacity-50">·</div>
                  {curr}
                </>
              ))}
            </div>

            <Ads />
          </div>
        </div>
      )}

      <OperationDrawer />
    </div>
  )
})

const Ads =
  dayjs().isAfter('2025-03-02 00:00:00+8') &&
  dayjs().isBefore('2025-04-02 00:00:00+8')
    ? () => (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a
          className="block relative dark:brightness-[85%]"
          href="https://adl.netease.com/d/g/mmwb/c/ad_MAA_cpa"
          target="_blank"
        >
          <img src="/ads_mumu.jpg" alt="MuMu模拟器" />
          <div className="absolute bottom-2 right-2 border border-current rounded text-[10px] text-zinc-300 px-1 ">
            广告
          </div>
        </a>
      )
    : () => null
