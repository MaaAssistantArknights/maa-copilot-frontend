import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translations from './translations.json'

const flattenTranslations = (obj, lang) => {
  const result = {}

  const flatten = (current, prefix = '') => {
    Object.entries(current).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (
        value &&
        typeof value === 'object' &&
        'cn' in value &&
        'en' in value
      ) {
        result[newKey] = value[lang]
      } else if (value && typeof value === 'object') {
        flatten(value, newKey)
      }
    })
  }

  flatten(obj)
  return result
}

const languageDetectorOptions = {
  order: ['localStorage', 'navigator'],
  lookupNavigator: 'language',
  convertDetectedLanguage: (lng: string) => {
    if (lng && (lng.startsWith('zh') || lng === 'cn')) {
      return 'cn'
    }
    return 'en'
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      cn: {
        translation: flattenTranslations(translations, 'cn'),
      },
      en: {
        translation: flattenTranslations(translations, 'en'),
      },
    },
    fallbackLng: 'cn',
    detection: languageDetectorOptions,
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
