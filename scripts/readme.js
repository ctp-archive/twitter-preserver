import fs from 'fs'
import help from '../src/help.js'

const readme = fs.readFileSync('./README.md').toString()

const helpStart = readme.search('```help')
const helpEnd = readme.search('```\n')

const newReadme = `${readme.slice(0, helpStart)}
\`\`\`help
${help()}
${readme.slice(helpEnd)}`

fs.writeFileSync('./README.md', newReadme)
