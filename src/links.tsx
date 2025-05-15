import { Icon as BlueprintIcon, Icon } from '@blueprintjs/core'
import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'
import { Icon as IconifyIcon } from '@iconify/react'

import { i18n, i18nDefer } from './i18n/i18n'

export const NAV_CONFIG = [
  {
    to: '/',
    labelKey: i18nDefer.links.home,
    icon: <Icon icon="home" />,
  },
  {
    to: '/create',
    labelKey: i18nDefer.links.create_job,
    icon: <Icon icon="add" />,
  },
  {
    to: '/editor',
    label: '作业编辑器v2',
    icon: 'annotation',
  },
  {
    to: '/about',
    labelKey: i18nDefer.links.about,
    icon: <Icon icon="info-sign" />,
  },
]

export const SOCIAL_CONFIG = [
  {
    icon: <BlueprintIcon icon="globe" className="mr-2" size={12} />,
    href: 'https://maa.plus',
    labelKey: i18nDefer.links.official_site,
  },
  {
    icon: <BlueprintIcon icon="edit" className="mr-2" size={12} />,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    labelKey: i18nDefer.links.feedback,
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    labelKey: i18nDefer.links.maa_repo,
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    labelKey: i18nDefer.links.frontend_repo,
  },
  {
    icon: (
      <IconifyIcon icon={simpleIconsGitHub} className="mr-2" fontSize="12px" />
    ),
    href: 'https://github.com/MaaAssistantArknights/MaaBackendCenter',
    labelKey: i18nDefer.links.backend_repo,
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    labelKey: () => i18n.links.creator_group({ groupNumber: '1169188429' }),
  },
  {
    icon: <IconifyIcon icon={simpleIconsQQ} className="mr-2" fontSize="12px" />,
    href: 'https://api.maa.plus/MaaAssistantArknights/api/qqgroup/index.html',
    labelKey: i18nDefer.links.sharing_group,
  },
]
