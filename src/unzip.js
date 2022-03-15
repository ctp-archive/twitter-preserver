import extract from 'extract-zip'
import crypto from 'crypto'
import ora from 'ora'
import chalk from 'chalk'

export default (source, expanded) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Extracting Twitter zip file',
    }).start()
    if (expanded) {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: 'Loaded Twitter archive',
      })
      resolve(source)
      return
    }
    const hash = crypto.createHash('md5').update(source).digest('hex')
    const path = `/tmp/${Date.now()}-${hash}`
    extract(source, { dir: path }).then((result) => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: 'Extracted ZIP file',
      })
      resolve(path)
    })
  })
