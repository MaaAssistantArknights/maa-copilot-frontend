import * as fs from 'fs'

const outputPath = './dist'
const azConfig = './staticwebapp.config.json'

fs.copyFileSync(azConfig, `${outputPath}/staticwebapp.config.json`)
