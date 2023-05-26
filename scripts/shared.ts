import { uniqBy } from 'lodash-es'
import fetch from 'node-fetch'
import pinyin from 'pinyin'

function transformOperatorName(name: string) {
  const cleanedName = name.replace(/[”“"]/g, '')

  const fullPinyin = pinyin(cleanedName, {
    compact: true,
    heteronym: true,
    style: pinyin.STYLE_NORMAL,
  })
  const partialPinyin = pinyin(cleanedName, {
    compact: true,
    heteronym: true,
    style: pinyin.STYLE_FIRST_LETTER,
  })
  return {
    name,
    pron:
      //  in: [[['a', 'mi', 'ya'], ['e', 'mi', 'ya']], [['a', 'm', 'y'], ['e', 'm', 'y']]]
      [fullPinyin, partialPinyin]
        // out: ['amiya', 'emiya', 'amy', 'emy']
        .flatMap((py) => py.map((el) => el.join('')))
        // out: 'amiya emiya amy emy'
        .join(' '),
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
