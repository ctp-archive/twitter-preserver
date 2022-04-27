import fs from 'fs/promises'
import extract from 'extract-zip'
import crypto from 'crypto'
import ora from 'ora'
import chalk from 'chalk'

export default (source) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Loading Twitter archive',
    }).start()

    fs.lstat(source).then((stat) => {
      if (stat.isDirectory()) {
        spinner.stopAndPersist({
          symbol: chalk.green('✔️'),
          text: 'Loaded Twitter archive',
        })
        resolve(source)
        return
      }
      spinner.text = 'Un-zipping Twitter archive'
      const hash = crypto.createHash('md5').update(source).digest('hex')
      const path = `/tmp/${Date.now()}-${hash}`
      extract(source, { dir: path }).then((result) => {
        spinner.stopAndPersist({
          symbol: chalk.green('✔️'),
          text: 'Extracted Twitter archive ZIP file',
        })
        resolve(path)
      })
    })
  })
