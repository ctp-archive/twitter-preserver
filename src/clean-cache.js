import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'

export default (path = './.cache') =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Removing cache files',
    }).start()
    fs.rm(path, { recursive: true, force: true }).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: 'Removed cache files',
      })
      resolve()
    })
  })
