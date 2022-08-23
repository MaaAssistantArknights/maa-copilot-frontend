import { uniqBy } from 'lodash-es'
import fetch from 'node-fetch'
import pinyin from 'pinyin'

function transformOperatorName(name: string) {
  const fullPinyin = pinyin(name, {
    segment: true,
    style: pinyin.STYLE_NORMAL,
  })
  const partialPinyin = pinyin(name, {
    segment: true,
    style: pinyin.STYLE_FIRST_LETTER,
  })
  return {
    name,
    pron: [
      fullPinyin.flatMap((el) => el).join(''),
      partialPinyin.flatMap((el) => el).join(''),
    ].join(' '),
  }
}

const CHARACTER_TABLE_JSON_URL =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json'

const CHARACTER_BLOCKLIST = [
  'char_512_aprot', // 暮落(集成战略)：It's just not gonna be there.
]

export async function getOperatorNames() {
  const resp = (await fetch(CHARACTER_TABLE_JSON_URL).then((res) =>
    res.json(),
  )) as any
  const ids = Object.keys(resp)
  const result = uniqBy(
    ids.flatMap((el) => {
      const op = resp[el]
      if (['TOKEN', 'TRAP'].includes(op.profession)) return []
      return [
        {
          id: el,
          ...transformOperatorName(op.name),
        },
      ]
    }),
    (el) => el.name,
  ).sort((a, b) => {
    return pinyin.compare(a.name, b.name)
  })
  return result.filter((el) => !CHARACTER_BLOCKLIST.includes(el.id))
}
