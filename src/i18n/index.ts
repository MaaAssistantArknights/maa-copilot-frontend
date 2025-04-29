import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

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
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    fallbackLng: 'cn',
    detection: languageDetectorOptions,
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
