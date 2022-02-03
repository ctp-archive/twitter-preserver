import fs from 'fs/promises'
import ora from 'ora'

export default () =>
  new Promise(async (resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Removing cache files',
    }).start()
    await fs.rm('./.cache', { recursive: true, force: true })
    spinner.stop()
    resolve()
  })
