import fs from 'fs/promises'
import ora from 'ora'
import fsExists from 'fs.promises.exists'
import https from 'https'

const regex = /http(s?):\/\/t.co\/([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g

export default ({ tweets }) =>
  new Promise(async (resolve, reject) => {
    const links = []
    if (!(await fsExists('./.cache'))) {
      await fs.mkdir('./.cache')
    }
    if (await fsExists('./.cache/links.json')) {
      const cachedLinks = await fs
        .readFile('./.cache/links.json')
        .then((result) => JSON.parse(result.toString()))
      resolve(cachedLinks)
    }
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Resolving Twitter URLs. This may take a while',
    }).start()
    tweets.forEach(({ tweet }) => {
      const matches = tweet.full_text.match(regex)
      if (matches) {
        matches.forEach((match) => {
          if (links.indexOf(match) === -1) {
            links.push(match)
          }
        })
      }
    })
    let current = 0
    const resolvedUrls = []
    const fetch = async () => {
      if (typeof links[current] === 'undefined') {
        await fs.writeFile('./.cache/links.json', JSON.stringify(resolvedUrls))
        spinner.stop()
        resolve(resolvedUrls)
        return
      }
      spinner.text = `Fetching ${links[current]}`
      https.get(links[current], (response, error) => {
        if (error) {
          reject(`HTTP error when fetching ${links[current]}`)
          return
        }
        resolvedUrls.push({
          url: links[current],
          code: response.statusCode,
          target:
            typeof response.headers.location !== 'undefined'
              ? response.headers.location
              : false,
        })
        current += 1
        fetch()
      })
    }
    fetch()
  })
