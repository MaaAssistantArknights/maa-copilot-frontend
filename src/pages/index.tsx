import { Icon as BlueprintIcon, Callout, Card } from '@blueprintjs/core'
import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'
import { Icon as IconifyIcon } from '@iconify/react'

import { ComponentType } from 'react'

import { CardTitle } from 'components/CardTitle'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { Operations } from 'components/Operations'
import { OperationEditorLauncher } from 'components/editor/OperationEditorLauncher'
import { OperationUploaderLauncher } from 'components/uploader/OperationUploaderLauncher'

const SOCIAL_LINKS = [
  {
    icon: <BlueprintIcon icon="globe" className="mr-2" size={12} />,
    href: 'https://maa.plus',
    label: 'MAA 官网',
  },
  {
    icon: <BlueprintIcon icon="edit" className="mr-2" size={12} />,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    label: '意见与反馈',
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    label: '前端 GitHub Repo',
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/MaaBackendCenter',
    label: '后端 GitHub Repo',
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    label: 'MAA GitHub Repo',
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    label: '作业制作者交流群：1169188429',
  },
]

export const IndexPage: ComponentType = withGlobalErrorBoundary(() => {
  return (
    <div className="flex flex-col md:flex-row px-8 mt-8 container mx-auto">
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8">
        <Callout title="2022/12/22 公告" className="mb-4" intent="primary">
          <p>
            服务器数据已不幸丢失，目前作业站后端正准备用 Java
            重写，如果有以下经验欢迎加入我们（JDK17，Gradle，MongoDB，SpringBoot）
          </p>
          <p>
            Repo 地址：
            <a href="https://github.com/MaaAssistantArknights/MaaBackendCenter">
              https://github.com/MaaAssistantArknights/MaaBackendCenter
            </a>
          </p>
        </Callout>
        <Operations />
      </div>
      <div className="md:w-1/3 order-1 md:order-2">
        <Card className="flex flex-col mb-4 space-y-2">
          <CardTitle icon="add" className="mb-4">
            创建新作业
          </CardTitle>

          <OperationEditorLauncher />

          <OperationUploaderLauncher />
        </Card>

        <div className="flex flex-wrap leading-relaxed mb-8">
          {SOCIAL_LINKS.map((link) => (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-zinc-600 no-underline"
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
      </div>
    </div>
  )
})
