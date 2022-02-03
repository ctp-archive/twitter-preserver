import extract from 'extract-zip'
import crypto from 'crypto'
import ora from 'ora'

export default (source, expanded) =>
  new Promise((resolve, reject) => {
    if (expanded) {
      resolve(source)
      return
    }
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Extracting Twitter zip file',
    }).start()
    const hash = crypto.createHash('md5').update(source).digest('hex')
    const path = `/tmp/${Date.now()}-${hash}`
    extract(source, { dir: path }).then((result) => {
      spinner.stop()
      resolve(path)
    })
  })
