import { access, writeFile } from 'fs/promises'
import fetch from 'node-fetch'

import { getOperatorNames } from './shared'

async function fileExists(file: string) {
  try {
    await access(file)
    return true
  } catch (e) {
    return false
  }
}

async function getAllAvatarsFromPrtsWiki() {
  console.info('fetching all avatars from prts wiki...')

  const baseUrl = `https://prts.wiki/api.php?action=query&list=allimages&aiprefix=头像&ailimit=500&format=json`
  const results: any[] = []

  let continueParams = new URLSearchParams()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = (await (
      await fetch(`${baseUrl}&${continueParams.toString()}`)
    ).json()) as any
    results.push(...resp.query.allimages)

    if (resp.continue) {
      continueParams = new URLSearchParams(resp.continue)
    } else {
      break
    }

    console.info(
      `fetched ${
        results.length
      } avatars. fetching next page from ${continueParams.get(
        'aicontinue',
      )}...`,
    )
  }

  console.info(`fetched ${results.length} avatars.`)

  return results
}

async function main() {
  console.info('update-operator-avatars: launched')

  const [operators, files] = await Promise.all([
    getOperatorNames(),
    getAllAvatarsFromPrtsWiki(),
  ])

  console.info('all metadata fetched.')

  for (const { id, name } of operators) {
    const withTokenName = id.startsWith('token_') ? `召唤物_${name}` : name
    const avatarUrl = files.find(
      (el) => el.name === `头像_${withTokenName}.png`,
    )?.url
    if (!avatarUrl) {
      console.error(`${name}: cannot found avatar file`)
      continue
    }
    const expectFileAt = `public/assets/operator-avatars/${id}.png`
    if (await fileExists(expectFileAt)) {
      // console.log(`${name}: already exists`)
      continue
    }
    console.log(`Downloading ${name} from ${avatarUrl}...`)
    const resp = await fetch(avatarUrl)
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
