import { Icon as BlueprintIcon } from '@blueprintjs/core'
import { Icon as IconifyIcon } from '@iconify/react'

import { useTranslation } from 'react-i18next'

import { NAV_CONFIG, SOCIAL_CONFIG } from '../links'

export const useLinks = () => {
  const { t } = useTranslation()

  // Transform static config to dynamic content with translations
  const NAV_LINKS = NAV_CONFIG.map((link) => ({
    to: link.to,
    label: t(link.labelKey),
    icon: link.icon,
  }))

  const SOCIAL_LINKS = SOCIAL_CONFIG.map((link) => {
    // Create the proper icon based on type
    let icon
    if (link.iconType === 'blueprint') {
      icon = (
        <BlueprintIcon icon={link.iconName as any} className="mr-2" size={12} />
      )
    } else if (link.iconType === 'iconify') {
      icon = (
        <IconifyIcon
          icon={link.iconSource as any}
          className="mr-2"
          fontSize="12px"
        />
      )
    }

    return {
      icon,
      href: link.href,
      label: t(link.labelKey, link.labelParams),
    }
  })

  return {
    NAV_LINKS,
    SOCIAL_LINKS,
  }
}
