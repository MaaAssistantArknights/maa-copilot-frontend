import { Icon as BlueprintIcon, IconName } from '@blueprintjs/core'
import { Icon as IconifyIcon } from '@iconify/react'
import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'

export const NAV_CONFIG: {
  to: string
  labelKey: string
  icon: IconName
}[] = [
  {
    to: '/',
    labelKey: 'links.home',
    icon: 'home',
  },
  {
    to: '/create',
    labelKey: 'links.create_job',
    icon: 'add',
  },
  {
    to: '/about',
    labelKey: 'links.about',
    icon: 'info-sign',
  }
]

export const SOCIAL_CONFIG = [
  {
    icon: <BlueprintIcon icon="globe" className="mr-2" size={12} />,
    href: 'https://maa.plus',
    labelKey: 'links.official_site',
  },
  {
    icon: <BlueprintIcon icon="edit" className="mr-2" size={12} />,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    labelKey: 'links.feedback',
  },
  {
    icon: <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />,
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    labelKey: 'links.maa_repo',
  },
  {
    icon: <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    labelKey: 'links.frontend_repo',
  },
  {
    icon: <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />,
    href: 'https://github.com/MaaAssistantArknights/MaaBackendCenter',
    labelKey: 'links.backend_repo',
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    labelKey: 'links.creator_group',
    labelParams: { groupNumber: '1169188429' },
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://ota.maa.plus/MaaAssistantArknights/api/qqgroup/index.html',
    labelKey: 'links.sharing_group',
  },
]
