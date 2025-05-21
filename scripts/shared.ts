import { access } from 'fs/promises'
import { capitalize, uniq, uniqBy } from 'lodash-es'
import fetch from 'node-fetch'
import { pinyin } from 'pinyin'
import simplebig from 'simplebig'

type Profession = { id: string; name: string; name_en?: string }
type Professions = (Profession & { sub: Profession[] })[]

export async function fileExists(file: string) {
  try {
    await access(file)
    return true
  } catch (e) {
    return false
  }
}

function pinyinify(name: string) {
  return [
    pinyin(name, {
      compact: true,
      heteronym: true,
      style: pinyin.STYLE_NORMAL,
    }),
    pinyin(name, {
      compact: true,
      heteronym: true,
      style: pinyin.STYLE_FIRST_LETTER,
    }),
  ].flatMap((py) => py.map((el) => el.join('')))
}

function transformOperatorName(name: string) {
  const cleanedName = name.replace(/[”“"]/g, '')

  const traditional = simplebig.s2t(name) as string
  const cleanedTraditional = traditional.replace(/[”“"]/g, '')

  return {
    name,
    alias: uniq([
      ...pinyinify(cleanedName),
      traditional,
      cleanedTraditional,
      ...pinyinify(cleanedTraditional),
    ]).join(' '),
  }
}

const CHARACTER_TABLE_JSON_URL_CN =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json'
const UNIEQUIP_TABLE_JSON_URL_CN =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/uniequip_table.json'
const CHARACTER_TABLE_JSON_URL_EN =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/character_table.json'
const UNIEQUIP_TABLE_JSON_URL_EN =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/uniequip_table.json'
const CHARACTER_BLOCKLIST = [
  'char_512_aprot', // 暮落(集成战略)：It's just not gonna be there.
  'token_10012_rosmon_shield', // 迷迭香的战术装备：It's just not gonna be there.
]

const PROFESSION_NAMES = {
  MEDIC: '医疗',
  WARRIOR: '近卫',
  SPECIAL: '特种',
  SNIPER: '狙击',
  PIONEER: '先锋',
  TANK: '重装',
  CASTER: '术师',
  SUPPORT: '辅助',
}

async function json(url: string) {
  return (await (await fetch(url)).json()) as any
}

export async function getOperators() {
  const [charTableCN, uniequipTableCN, charTableEN, uniequipTableEN] =
    await Promise.all([
      json(CHARACTER_TABLE_JSON_URL_CN),
      json(UNIEQUIP_TABLE_JSON_URL_CN),
      json(CHARACTER_TABLE_JSON_URL_EN),
      json(UNIEQUIP_TABLE_JSON_URL_EN),
    ])

  const { subProfDict: subProfDictCN } = uniequipTableCN
  const { subProfDict: subProfDictEN } = uniequipTableEN

  const opIds = Object.keys(charTableCN)
  const professions: Professions = []
  const result = uniqBy(
    opIds.flatMap((id) => {
      const op = charTableCN[id]
      const enName = charTableEN[id]?.name || op.appellation || op.name

      if (['TRAP'].includes(op.profession)) return []

      if (!['TOKEN'].includes(op.profession)) {
        const prof = professions.find((p) => p.id === op.profession)
        if (!prof) {
          const enSubProfName =
            subProfDictEN?.[op.subProfessionId]?.subProfessionName ||
            capitalize(op.subProfessionId)

          professions.push({
            id: op.profession,
            name: PROFESSION_NAMES[op.profession],
            name_en:
              op.profession.charAt(0) + op.profession.slice(1).toLowerCase(),
            sub: [
              {
                id: op.subProfessionId,
                name: subProfDictCN[op.subProfessionId].subProfessionName,
                name_en: enSubProfName,
              },
            ],
          })
        } else if (!prof.sub.find((p) => p.id === op.subProfessionId)) {
          const enSubProfName =
            subProfDictEN?.[op.subProfessionId]?.subProfessionName ||
            capitalize(op.subProfessionId)

          prof.sub.push({
            id: op.subProfessionId,
            name: subProfDictCN[op.subProfessionId].subProfessionName,
            name_en: enSubProfName,
          })
        }
      }
      return [
        {
          id: id,
          prof: op.profession,
          subProf: op.subProfessionId,
          name_en: enName,
          ...transformOperatorName(op.name),
          rarity:
            op.subProfessionId === 'notchar1'
              ? 0
              : Number(op.rarity?.split('TIER_').join('') || 0),
          alt_name: op.appellation,
        },
      ]
    }),
    (el) => el.id,
  ).sort((a, b) => {
    // 默认的 pinyin.compare() 没有传入 locale 参数，导致在不同的系统上有不同的排序结果，
    // 所以这里手动实现一下，并带上 locale
    // https://github.com/MaaAssistantArknights/maa-copilot-frontend/pull/265
    const pinyinA = String(pinyin(a.name))
    const pinyinB = String(pinyin(b.name))
    return (
      pinyinA.localeCompare(pinyinB, 'zh') || a.id.localeCompare(b.id, 'en')
    )
  })
  return {
    professions,
    operators: result.filter((el) => !CHARACTER_BLOCKLIST.includes(el.id)),
  }
}
