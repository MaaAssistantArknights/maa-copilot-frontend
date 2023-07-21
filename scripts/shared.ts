import { uniqBy } from 'lodash-es'
import fetch from 'node-fetch'
import pinyin from 'pinyin'
import simplebig from 'simplebig'

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
  const cleanedSimplifiedName = name.replace(/[”“"]/g, '')

  const traditional = simplebig.s2t(name) as string
  const cleanedTraditional = traditional.replace(/[”“"]/g, '')
  return {
    name,
    alias: [
      ...pinyinify(cleanedSimplifiedName),
      traditional,
      cleanedTraditional,
      ...pinyinify(cleanedTraditional),
    ].join(' '),
  }
}

const CHARACTER_TABLE_JSON_URL =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json'

const CHARACTER_BLOCKLIST = [
  'char_512_aprot', // 暮落(集成战略)：It's just not gonna be there.
  'token_10012_rosmon_shield', // 迷迭香的战术装备：It's just not gonna be there.
]

export async function getOperatorNames() {
  const resp = (await fetch(CHARACTER_TABLE_JSON_URL).then((res) =>
    res.json(),
  )) as any
  const ids = Object.keys(resp)
  const result = uniqBy(
    ids.flatMap((el) => {
      const op = resp[el]
      if (['TRAP'].includes(op.profession)) return []
      return [
        {
          id: el,
          ...transformOperatorName(op.name),
          alt_name: op.appellation,
        },
      ]
    }),
    (el) => el.name,
  ).sort((a, b) => {
    return pinyin.compare(a.name, b.name)
  })
  return result.filter((el) => !CHARACTER_BLOCKLIST.includes(el.id))
}
