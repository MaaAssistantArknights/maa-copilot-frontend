import simpleIconsGitHub from '@iconify/icons-simple-icons/github'
import simpleIconsQQ from '@iconify/icons-simple-icons/tencentqq'

// Keep only the static configuration data
export const NAV_CONFIG = [
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
  },
]

export const SOCIAL_CONFIG = [
  {
    iconType: 'blueprint',
    iconName: 'globe',
    href: 'https://maa.plus',
    labelKey: 'links.official_site',
  },
  {
    iconType: 'blueprint',
    iconName: 'edit',
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend/issues/new/choose',
    labelKey: 'links.feedback',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
    labelKey: 'links.maa_repo',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/maa-copilot-frontend',
    labelKey: 'links.frontend_repo',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsGitHub,
    href: 'https://github.com/MaaAssistantArknights/MaaBackendCenter',
    labelKey: 'links.backend_repo',
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsQQ,
    href: 'https://jq.qq.com/?_wv=1027&k=ElimpMzQ',
    labelKey: 'links.creator_group',
    labelParams: { groupNumber: '1169188429' }, // Modifiable group number
  },
  {
    iconType: 'iconify',
    iconSource: simpleIconsQQ,
    href: 'https://ota.maa.plus/MaaAssistantArknights/api/qqgroup/index.html',
    labelKey: 'links.sharing_group',
  },
]
