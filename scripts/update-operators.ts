import { writeFile } from 'fs/promises'
import process from 'process'

import { getOperators } from './shared'

async function main() {
  console.info('Fetching operators...')
  const { operators, professions } = await getOperators()

  const content = JSON.stringify({
    OPERATORS: operators,
    PROFESSIONS: professions,
  })

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
