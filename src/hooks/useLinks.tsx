import { useTranslation } from 'react-i18next'
import { NAV_CONFIG, SOCIAL_CONFIG } from '../links'

export const useLinks = () => {
  const { t } = useTranslation()

  const NAV_LINKS = NAV_CONFIG.map(({ to, labelKey, icon }) => ({
    to,
    label: t(labelKey),
    icon,
  }))

  const SOCIAL_LINKS = SOCIAL_CONFIG.map(({ icon, href, labelKey, labelParams }) => ({
    icon,
    href,
    label: t(labelKey, labelParams),
  }))

  return { NAV_LINKS, SOCIAL_LINKS }
}
