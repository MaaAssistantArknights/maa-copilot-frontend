import { writeFile } from 'node:fs/promises'
import * as prettier from 'prettier'
import process from 'process'

import { getOperators } from './shared'

async function main() {
  console.info('Fetching operators...')
  const { operators, professions } = await getOperators()

  const content = JSON.stringify({
    OPERATORS: operators,
    PROFESSIONS: professions,
  })

  const prettierConfig = await prettier.resolveConfig(process.cwd())
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: 'json',
  })

  console.info('Writing to operators.json...')
  await writeFile('src/models/generated/operators.json', formatted)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
