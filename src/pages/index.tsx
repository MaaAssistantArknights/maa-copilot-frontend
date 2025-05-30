import { Card } from '@blueprintjs/core'

import dayjs from 'dayjs'
import { useLinks } from 'hooks/useLinks'
import { ComponentType } from 'react'

import { CardTitle } from 'components/CardTitle'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { Operations } from 'components/Operations'
import { OperationDrawer } from 'components/drawer/OperationDrawer'
import { OperationEditorLauncher } from 'components/editor/OperationEditorLauncher'
import { OperationSetEditorLauncher } from 'components/operation-set/OperationSetEditor'
import { OperationUploaderLauncher } from 'components/uploader/OperationUploaderLauncher'

import { AnnPanel } from '../components/announcement/AnnPanel'
import { useTranslation } from '../i18n/i18n'
import { useCurrentSize } from '../utils/useCurrenSize'

export const IndexPage: ComponentType = withGlobalErrorBoundary(() => {
  const { isMD } = useCurrentSize()
  const t = useTranslation()
  const { SOCIAL_LINKS } = useLinks()
  return (
    <div className="flex flex-col md:flex-row px-4 pb-16 mt-4 md:px-8 md:mt-8 max-w-[96rem] mx-auto">
      {isMD && <Ad />}
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8 mt-4 md:mt-0">
        <Operations />
      </div>
      {!isMD && (
        <div className="md:w-1/3 order-1 md:order-2">
          <div className="top-20">
            {/* // 主内容区卡片容器 - 添加阴影和悬停效果 */}
            <Card className="flex flex-col mb-4 space-y-2 shadow-lg hover:shadow-xl transition-shadow">
              {/* // 卡片标题 - 加大字号和强调色 */}
              <CardTitle icon="add" className="mb-4 text-2xl font-bold text-blue-600">
                {t.pages.index.create_new_task}
              </CardTitle>
              
              {/* // 功能按钮区域 */}
              <OperationEditorLauncher />
              <OperationUploaderLauncher />
              <OperationSetEditorLauncher />
            </Card>
            
            // 社交链接容器 - 网格布局适配移动端
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 mb-4">
              {SOCIAL_LINKS.map((link) => (
                // 单个社交链接 - 添加悬停反馈效果
                <a
                  className="flex items-center p-3 space-x-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-zinc-600 dark:text-slate-100 no-underline"
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
            </div>
            
            {/* // 广告卡片组件 - 新增圆角和渐变背景 */}
            <a className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 transition-transform hover:scale-[1.02]">
              {/* 广告图片 - 添加悬停透明度变化 */}
              <img 
                src="/ad_leidian.jpg" 
                className="rounded-2xl hover:opacity-90 transition-opacity"
                alt="雷电模拟器" 
              />
              {/* // 广告标识 - 毛玻璃效果标签 */}
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm text-xs rounded-full border border-gray-200">
                {t.pages.index.advertisement}
              </div>
            </a>
          </div>
        </div>
      )}

      <OperationDrawer />
    </div>
  )
})

const Ad = dayjs().isBefore('2025-05-11 00:00:00+8')
  ? () => {
      const t = useTranslation()
      return (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a
          className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 transition-transform hover:scale-[1.02]">
          <img 
            src="/ad_leidian.jpg" 
            className="rounded-2xl hover:opacity-90 transition-opacity"
            alt="雷电模拟器" 
          />
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm text-xs rounded-full border border-gray-200">
            {t.pages.index.advertisement}
          </div>
        </a>
      )
    }
  : () => null
