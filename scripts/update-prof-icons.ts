// future feature
import { mkdir, writeFile } from 'fs/promises'
import fetch from 'node-fetch'

import { fileExists, getOperators } from './shared'

const outDir = 'public/assets/prof-icons'

async function getSubProfIconsFromPrtsWiki() {
  console.info('fetching all sub-profession icons from prts wiki...')

  const baseUrl = `https://prts.wiki/api.php?action=query&list=allimages&aiprefix=职业分支图标&ailimit=500&format=json`
  const resp = (await (await fetch(baseUrl)).json()) as any
  const results = resp.query.allimages

  console.info(`fetched ${results.length} sub-profession icons.`)

  return results
}

async function main() {
  console.info('update-prof-icons: launched')

  if (!(await fileExists(outDir))) {
    console.info(`creating directory ${outDir}...`)
    await mkdir(outDir)
  }

  const [{ professions }, files] = await Promise.all([
    getOperators(),
    getSubProfIconsFromPrtsWiki(),
  ])

  console.info('all metadata fetched.')

  const subProfs = professions.flatMap((p) => p.sub)

  for (const { id, name } of subProfs) {
    const url = files.find((el) => el.name === `职业分支图标_${name}.png`)?.url
    if (!url) {
      console.error(`${name}: cannot found icon`)
      continue
    }
    const expectFileAt = `${outDir}/${id}.png`
    if (await fileExists(expectFileAt)) {
      // console.log(`${name}: already exists`)
      continue
    }
    console.log(`Downloading ${name} from ${url}...`)
    const resp = await fetch(url)
    if (!resp.ok) {
      console.error(`${name} failed to download`)
      continue
    }

    const buffer = await resp.arrayBuffer()
    await writeFile(expectFileAt, Buffer.from(buffer))
    console.info(`${name}: downloaded`)
  }
}

main()
  .then(() => {
    console.log('Done')
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(() => {
    process.exit(0)
  })
