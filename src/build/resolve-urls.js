import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'
import fsExists from 'fs.promises.exists'
import fetch from 'node-fetch'

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

    if (profile.description.website.search(regex) > -1) {
      spinner.text = `Resolving profile website ${profile.description.website}`
      await fetch(profile.description.website, {
        method: 'HEAD',
        redirect: 'manual',
      })
        .then((result) => {
          const location = result.headers.get('location')
          links.push({
            url: profile.description.website,
            twitter_link: false,
            expanded_url: location,
            display_url: location.replace(/http(s?):\/\//g, ''),
          })
        })
        .catch((error) => {})
    }

    tweets.forEach(({ tweet }) => {
      const matches = tweet.full_text.match(regex)
      if (matches) {
        matches.forEach((match) => {
          if (typeof links.find((link) => link.url === match) === 'undefined') {
            links.push({
              url: match,
              twitter_link: true,
              expanded_url: false,
              display_url: false,
            })
          }
        })
      }
    })

    let current = -1

    const findTwitterLinks = async () => {
      current += 1

      if (typeof links[current] === 'undefined') {
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
      if (
        typeof links[current].twitter_link === 'undefined' ||
        !links[current].twitter_link
      ) {
        setImmediate(() => findTwitterLinks())
        return
      }
      spinner.text = `Resolving Twitter link ${links[current].url}`
      await fetch(links[current].url, {
        method: 'HEAD',
        redirect: 'manual',
      })
        .then((result) => {
          const location = result.headers.get('location')
          links[current].expanded_url = location
          links[current].display_url = location.replace(/http(s?):\/\//g, '')
        })
        .catch((error) => {})
      setImmediate(() => findTwitterLinks())
    }

    findTwitterLinks()
  })
