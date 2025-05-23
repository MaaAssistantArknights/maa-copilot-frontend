import { atom, getDefaultStore, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { get, isObject, isString } from 'lodash-es'
import mitt from 'mitt'
import { Fragment, ReactElement, ReactNode, createElement } from 'react'
import { ValueOf } from 'type-fest'

import ESSENTIALS from './generated/essentials'

export const languages = ['cn', 'en'] as const
const defaultLanguage = navigator.language.startsWith('zh') ? 'cn' : 'en'

const updater = mitt()

export type Language = (typeof languages)[number]

export type I18NTranslations = MakeTranslations<
  | typeof import('./generated/cn').default
  | typeof import('./generated/en').default
> & { essentials: I18NEssentials }

type I18NEssentials = MakeTranslations<(typeof ESSENTIALS)[Language]>

type MakeTranslations<T> = MakeEndpoints<ParseValue<T>>

type ParseValue<T> = T extends string
  ? ParseMessage<T, []>
  : T extends PluralObject
    ? ParseMessage<T['other'], ['count']>
    : { [P in keyof T]: ParseValue<T[P]> }

type ParseMessage<
  T extends string,
  InitialKeys extends unknown[],
  Keys = InterpolationKeys<T, InitialKeys>,
> = Keys extends [] ? string : Keys

type InterpolationKeys<
  Str,
  Keys extends unknown[],
> = Str extends `${string}{{${infer Key}}}${infer End}`
  ? InterpolationKeys<End, [...Keys, Key extends '' ? UnnamedKey : Key]>
  : Keys

type PluralObject = Record<`${number}` | 'other', string>

type MakeEndpoints<T, K extends keyof T = keyof T> = string extends T
  ? T
  : [T] extends [unknown[]]
    ? Endpoint<T>
    : { [P in K]: MakeEndpoints<T[P]> }

type Endpoint<Keys extends unknown[]> = Keys[number] extends UnnamedKey
  ? UnnamedInterpolation<{ [K in keyof Keys]: ReactNode }>
  : Interpolation<{ [K in Extract<Keys[number], string>]: ReactNode }>

type Interpolation<Arg> = <T extends Arg>(
  ...args: [T]
) => InterpolationResult<ValueOf<T>>

type UnnamedInterpolation<Arg extends unknown[]> = <T extends Arg>(
  ...args: T
) => InterpolationResult<T[number]>

type InterpolationResult<T> = T extends string | number ? string : ReactElement

declare const unnamedKey: unique symbol
type UnnamedKey = typeof unnamedKey

export const allEssentials = Object.fromEntries(
  Object.entries(ESSENTIALS).map(([language, data]) => [
    language,
    setupTranslations({
      language: language as Language,
      data,
    }),
  ]),
) as Record<Language, I18NEssentials>

const languageStorageKey = 'maa-copilot-lang'

let currentLanguage: Language
let currentTranslations: I18NTranslations | undefined

export const i18n = new Proxy(
  {} as I18NTranslations & { currentLanguage: Language },
  {
    get(target, prop) {
      if (prop === 'currentLanguage') {
        return currentLanguage
      }
      if (!currentTranslations) {
        if (prop === 'essentials') {
          return allEssentials[currentLanguage]
        }
        // if this error occurs during dev, it's probably because the code containing i18n.* is executed
        // before the translations are loaded, in which case you should change it to i18nDefer.*
        throw new Error(allEssentials[currentLanguage].translations_not_loaded)
      }
      return currentTranslations[prop] || prop
    },
  },
)

type Deferred<T> = T extends string
  ? () => string
  : T extends Function
    ? T
    : { [K in keyof T]: Deferred<T[K]> }

export const i18nDefer = createDeferredProxy(
  '',
) as unknown as Deferred<I18NTranslations>

function createDeferredProxy(path: string) {
  const toString = () => path

  let updatedValue: unknown
  updater.on(path, (value) => (updatedValue = value))

  return new Proxy(toString, {
    get(target, prop) {
      if (prop === 'toString') {
        return toString
      }
      if (Object.prototype.hasOwnProperty.call(target, prop)) {
        return target[prop]
      }
      if (typeof prop === 'symbol') {
        return undefined
      }
      target[prop] = createDeferredProxy(
        (path ? path + '.' : '') + String(prop),
      )
      return target[prop]
    },
    apply(target, _this, args) {
      if (updatedValue !== undefined) {
        if (typeof updatedValue === 'function') {
          return updatedValue(...args)
        }
        return updatedValue
      }
      if (currentTranslations) {
        const translated = get(currentTranslations, path)
        if (translated) {
          return translated
        }
      }
      return toString()
    },
  })
}

export const languageAtom = atomWithStorage<Language>(
  languageStorageKey,
  defaultLanguage,
  undefined,
  { getOnInit: true },
)

currentLanguage = getDefaultStore().get(languageAtom)

export interface RawTranslations {
  language: Language
  data: object
}

const internalRawTranslationsAtom = atom<RawTranslations | undefined>(undefined)
export const rawTranslationsAtom = atom(
  (get) => get(internalRawTranslationsAtom),
  (get, set, rawTranslations: RawTranslations) => {
    const translations = setupTranslations(rawTranslations) as I18NTranslations
    currentLanguage = rawTranslations.language
    currentTranslations = translations

    set(internalRawTranslationsAtom, rawTranslations)
    set(translationsAtom, translations)
  },
)
const internalTranslationsAtom = atom<I18NTranslations | undefined>(undefined)
export const translationsAtom = atom(
  (get) => {
    const translations = get(internalTranslationsAtom)
    if (!translations) {
      throw new Error(allEssentials[currentLanguage].translations_not_loaded)
    }
    return translations
  },
  (get, set, translations: I18NTranslations) =>
    set(internalTranslationsAtom, translations),
)

function setupTranslations({ language, data }: RawTranslations) {
  data = {
    ...data,
    essentials: ESSENTIALS[language],
  }

  const interpolationRegex = /{{([^}]*)}}/

  const convert = (path: string, value: unknown) => {
    const converted = doConvert(path, value)
    updater.emit(path, converted)
    return converted
  }

  const doConvert = (path: string, value: unknown) => {
    let isPlural = false

    if (isObject(value)) {
      const keys = Object.keys(value)
      isPlural = keys.every(
        (key) => key === 'other' || !Number.isNaN(Number(key)),
      )
      if (!isPlural) {
        return Object.fromEntries(
          keys.map((key) => [key, convert(`${path}.${key}`, value[key])]),
        )
      }
    } else if (!isString(value)) {
      return value
    } else {
      const hasInterpolation = interpolationRegex.test(value)
      if (!hasInterpolation) {
        return value
      }
    }

    // as of now, value is either an interpolatable string or a plural object

    return (...args: unknown[]) => {
      try {
        let message: string

        if (isPlural) {
          const pluralObject = value as PluralObject
          const count = isObject(args[0])
            ? (args[0] as Record<string, unknown>).count
            : undefined
          if (typeof count === 'number') {
            message = pluralObject[String(count)] ?? pluralObject.other
          } else {
            message = pluralObject.other
          }
        } else {
          message = value as string
        }

        const segments = message.split(interpolationRegex)
        if (segments.length === 1) {
          return message
        }
        let hasJsx = false
        const translated = segments.map((segment, index) => {
          if (index % 2 === 0) {
            return segment
          }
          if (!segment) {
            const valueIndex = (index - 1) / 2
            const value = args[valueIndex]
            if (!value) {
              return ''
            }
            if (typeof value !== 'string' && typeof value !== 'number') {
              hasJsx = true
            }
            return value
          }

          const value = args[0]?.[segment]
          if (!value) {
            return ''
          }
          if (typeof value !== 'string' && typeof value !== 'number') {
            hasJsx = true
          }
          return value
        })
        if (hasJsx) {
          return createElement(Fragment, {}, ...translated)
        }
        return translated.join('')
      } catch (e) {
        console.error('Error in translation:', path, e)
        return path
      }
    }
  }

  return convert('', data)
}

export function useTranslation() {
  return useAtomValue(translationsAtom)
}
