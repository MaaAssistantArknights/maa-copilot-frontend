import { Card, Icon as BlueprintIcon } from '@blueprintjs/core'
import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import { Icon as IconifyIcon } from '@iconify/react'
import { CardTitle } from 'components/CardTitle'
import { OperationEditorLauncher } from 'components/editor/OperationEditorLauncher'
import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { Operations } from 'components/Operations'
import { OperationUploaderLauncher } from 'components/uploader/OperationUploaderLauncher'
import { ComponentType } from 'react'

const SOCIAL_LINKS = [
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    label: '本站 GitHub Repo',
  },
  {
    icon: <BlueprintIcon icon="edit" className="mr-2" size={12} />,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    label: '意见与反馈',
  },
  {
    icon: <BlueprintIcon icon="globe" className="mr-2" size={12} />,
    href: 'https://maa.plus',
    label: 'MAA 官网',
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    label: 'MAA GitHub Repo',
  },
]

export const IndexPage: ComponentType = withGlobalErrorBoundary(() => {
  return (
    <div className="flex flex-col md:flex-row px-8 mt-8">
      <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8">
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

        <div className="flex flex-wrap">
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
