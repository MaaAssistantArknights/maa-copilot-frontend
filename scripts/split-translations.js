const fs = require('fs')
const path = require('path')

const translations = require('../src/i18n/translations.json')

const outputDir = path.join(__dirname, '../public/locales')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const languages = ['en', 'cn']

function extractLanguageData(lang) {
  const result = {}

  function extractFromObject(obj, currentPath = []) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = [...currentPath, key]

      if (
        value &&
        typeof value === 'object' &&
        'cn' in value &&
        'en' in value
      ) {
        setNestedValue(result, newPath, value[lang])
      } else if (value && typeof value === 'object') {
        extractFromObject(value, newPath)
      }
    }
  }

  function setNestedValue(obj, path, value) {
    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {}
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
  }

  extractFromObject(translations)
  return result
}

languages.forEach((lang) => {
  const data = extractLanguageData(lang)
  fs.writeFileSync(
    path.join(outputDir, `${lang}.json`),
    JSON.stringify(data, null, 2),
  )
  console.log(`Generated ${lang}.json`)
})
