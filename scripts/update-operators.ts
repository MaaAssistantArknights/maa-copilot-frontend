import { writeFile } from 'node:fs/promises'
import process from 'process'

import { getOperatorNames } from './shared'

async function main() {
  console.info('Fetching character_table.json...')
  const names = await getOperatorNames()

  console.info('Parsing character_table.json...')
  const content = JSON.stringify(names, null, 2)

  console.info('Writing to operators.json...')
  await writeFile('src/models/generated/operators.json', content)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
