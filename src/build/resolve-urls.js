import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'
import fsExists from 'fs.promises.exists'
import axios from 'axios'
import path from 'path'
import getMeta from 'lets-get-meta'

const regex = /http(s?):\/\/t.co\/([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g

export default ({ tweets, profile, checksum }) =>
  new Promise(async (resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Resolving Twitter URLs. This may take a while',
    }).start()

    if (!(await fsExists('./.cache'))) {
      await fs.mkdir('./.cache')
    }
    if (await fsExists(`./.cache/links-${checksum}.json`)) {
      const cachedLinks = await fs
        .readFile(`./.cache/links-${checksum}.json`)
        .then((result) => JSON.parse(result.toString()))
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: `Loaded ${cachedLinks.length.toLocaleString()} links from cache`,
      })
      resolve(cachedLinks)
      return
    }

    const links = tweets.flatMap(({ tweet }) => tweet.entities.urls)

    let current = -1

    const fetch = async () => {
      current += 1
      if (typeof links[current] === 'undefined') {
        console.log(links)
        await fs.writeFile(
          `./.cache/links-${checksum}.json`,
          JSON.stringify(links),
        )

        spinner.stopAndPersist({
          symbol: chalk.green('✔️'),
          text: `Loaded ${links.length.toLocaleString()} links`,
        })
        resolve(links)
        return
      }

      const { expanded_url } = links[current]

      spinner.text = `Getting metadata from ${expanded_url}`

      const extension = path.extname(expanded_url)

      if (['htm', 'html', '', false].indexOf(extension) === -1) {
        setImmediate(() => fetch())
      }
      await axios
        .get(expanded_url)
        .then((result) => {
          if (result.status === 200) {
            links[current].meta = getMeta(result.data)
          }
        })
        .catch((error) => {
          spinner.text = `Error fetching ${expanded_url}`
        })

      setImmediate(() => fetch())
    }

    fetch()
  })
