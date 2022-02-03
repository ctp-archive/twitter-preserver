import ora from 'ora'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import nunjucks from 'nunjucks'
import indexPage from './index-page.js'
import tweetsPage from './tweets.js'

const extractJson = contents =>
  JSON.parse(contents.replace(/window.[(A-Za-z0-9\.]* = /, ''))

export default (source, templates, output) =>
  new Promise(async (resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Building files',
    }).start()

    if (!(await fsExists(`${templates}/style.css`))) {
      reject(`The template directory is missing a stylesheet`)
      return
    }
    const style = await (await fs.readFile(`${templates}/style.css`)).toString()
    const njkEnvironment = nunjucks.configure(templates)
    njkEnvironment.addGlobal('style', style)

    if (!(await fsExists(`${source}/Your archive.html`))) {
      reject(`The provided ZIP file is not a Twitter archive`)
      return
    }

    const account = await fs
      .readFile(`${source}/data/account.js`)
      .then(contents => extractJson(contents.toString())[0].account)

    const tweets = await fs
      .readFile(`${source}/data/tweet.js`)
      .then(contents => extractJson(contents.toString()))

    if (!(await fsExists(output))) {
      await fs.mkdir(output)
    }
    await indexPage(njkEnvironment, { output, templates, account })
    await tweetsPage(njkEnvironment, { output, templates, tweets, account })

    resolve(source)
    spinner.stop()
  })
