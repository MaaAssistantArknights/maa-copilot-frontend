import { access } from 'fs/promises'
import { compact, last, uniq, uniqBy } from 'lodash-es'
import fetch from 'node-fetch'
import { pinyin } from 'pinyin'
import simplebig from 'simplebig'

type Profession = { id: string; name: string }
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

const CHARACTER_TABLE_JSON_URL =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json'
const UNIEQUIP_TABLE_JSON_URL =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/uniequip_table.json'
const SKILL_TABLE_JSON_URL =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/skill_table.json'

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
  const [charTable, uniequipTable, skillTable] = await Promise.all([
    json(CHARACTER_TABLE_JSON_URL),
    json(UNIEQUIP_TABLE_JSON_URL),
    json(SKILL_TABLE_JSON_URL),
  ])
  const { equipDict, subProfDict } = uniequipTable
  const equipsByOperatorId = Object.values(equipDict).reduce(
    (acc: Record<string, any[]>, equip: any) => {
      acc[equip.charId] ||= []
      acc[equip.charId].push(equip)
      return acc
    },
    {},
  )

  const opIds = Object.keys(charTable)
  const professions: Professions = []
  const result = uniqBy(
    opIds.flatMap((id) => {
      const op = charTable[id]
      if (['TRAP'].includes(op.profession)) return []

      if (!['TOKEN'].includes(op.profession)) {
        const prof = professions.find((p) => p.id === op.profession)
        if (!prof) {
          professions.push({
            id: op.profession,
            name: PROFESSION_NAMES[op.profession],
            sub: [
              {
                id: op.subProfessionId,
                name: subProfDict[op.subProfessionId].subProfessionName,
              },
            ],
          })
        } else if (!prof.sub.find((p) => p.id === op.subProfessionId)) {
          prof.sub.push({
            id: op.subProfessionId,
            name: subProfDict[op.subProfessionId].subProfessionName,
          })
        }
      }
      const equips = equipsByOperatorId[id]
        ?.sort((a, b) => a.charEquipOrder - b.charEquipOrder)
        .map(({ typeName1, typeName2 }) => {
          return typeName1 === 'ORIGINAL' ? '' : typeName2
        })
      const skills = ['TOKEN'].includes(op.profession)
        ? [] // 召唤物无需选择技能，所以不需要技能信息
        : compact(
            (op.skills as any[]).map(
              ({ skillId }: { skillId: string | null }) => {
                if (!skillId) return null
                // 技能的每级都有一个 name，直接取等级最高的那个，以防鹰角背刺
                const name = last<{ name: string }>(
                  skillTable[skillId].levels,
                )?.name
                if (!name) {
                  console.error(`Invalid skill: ${op.name} - ${skillId}`)
                  return null
                }
                return name
              },
            ),
          )
      return [
        {
          id: id,
          prof: op.profession,
          subProf: op.subProfessionId,
          ...transformOperatorName(op.name),
          rarity:
            op.subProfessionId === 'notchar1'
              ? 0
              : Number(op.rarity?.split('TIER_').join('') || 0),
          alt_name: op.appellation,
          skills,
          equips,
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
