import { Icon as BlueprintIcon, IconName } from '@blueprintjs/core'
import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'
import { Icon as IconifyIcon } from '@iconify/react'

export const NAV_LINKS: {
  to: string
  label: string
  icon: IconName
}[] = [
  {
    to: '/',
    label: '首页',
    icon: 'home',
  },
  {
    to: '/create',
    label: '创建作业',
    icon: 'add',
  },
  {
    to: '/about',
    label: '关于',
    icon: 'info-sign',
  },
]

export const SOCIAL_LINKS = [
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
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    label: 'MAA GitHub Repo',
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
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    label: '作业制作者交流群：1169188429',
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://ota.maa.plus/MaaAssistantArknights/api/qqgroup/index.html',
    label: '作业分享群',
  },
]
