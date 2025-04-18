import { Button, Menu, MenuItem, Position } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentSize } from 'utils/useCurrenSize'

import { withGlobalErrorBoundary } from './GlobalErrorBoundary'

export const LanguageSwitcher: ComponentType = withGlobalErrorBoundary(() => {
  const { i18n } = useTranslation()
  const { isSM } = useCurrentSize()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <Popover2
      content={
        <Menu
          style={{
            width: '103.5px', // 103.5px to get same width as the button
            padding: '4px 0',
            minWidth: 'unset',
          }}
        >
          <MenuItem
            text="English"
            icon={i18n.language === 'en' ? 'tick' : undefined}
            onClick={() => changeLanguage('en')}
          />
          <MenuItem
            text="中文"
            icon={i18n.language === 'cn' ? 'tick' : undefined}
            onClick={() => changeLanguage('cn')}
          />
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        icon="translate"
        text={!isSM && (i18n.language === 'cn' ? '中文' : 'English')}
        rightIcon="caret-down"
        style={{
          width: '120px',
        }}
      />
    </Popover2>
  )
})
