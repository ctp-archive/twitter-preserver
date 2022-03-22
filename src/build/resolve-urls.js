import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'
import fsExists from 'fs.promises.exists'
import fetch from 'node-fetch'
import twitterRegex from './twitter-regex.js'

const checkCacheDirectory = () =>
  new Promise((resolve, reject) => {
    fsExists('./.cache').then((exists) => {
      if (exists) {
        resolve()
        return
      }
      fs.mkdir('./.cache')
        .then(() => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  })

const loadCachedLinks = (checksum) =>
  new Promise((resolve, reject) => {
    fsExists(`./.cache/links-${checksum}.json`)
      .then((exists) => {
        if (!exists) {
          resolve(false)
          return
        }
        return fs.readFile(`./.cache/links-${checksum}.json`)
      })
      .then((result) => JSON.parse(result.toString()))
      .catch((error) => reject(error))
  })

const fetchProfileWebsite = (profile) =>
  new Promise((resolve, reject) => {
    fetch(profile.description.website, {
      method: 'HEAD',
      redirect: 'manual',
    })
      .then((result) => {
        const location = result.headers.get('location')
        resolve({
          url: profile.description.website,
          twitter_link: false,
          expanded_url: location,
          display_url: location.replace(/http(s?):\/\//g, ''),
        })
      })
      .catch((error) => {
        reject(error)
      })
  })

const parseExistingLinks = ({ tweets, dms, likes }) => {
  const links = tweets.flatMap(({ tweet }) => tweet.entities.urls)

  if (dms) {
    dms.forEach(({ dmConversation }) => {
      dmConversation.messages.forEach((message) => {
        if (typeof message.messageCreate === 'undefined') {
          return
        }
        message.messageCreate.urls.forEach((url) => {
          links.push({
            url: url.url,
            expanded_url: url.expanded_url,
            display_url: url.display,
          })
        })
      })
    })
  }
  if (likes) {
    likes.forEach(({ like }) => {
      const matches = like.fullText.match(twitterRegex)
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
  }
  if (tweets) {
    tweets.forEach(({ tweet }) => {
      const matches = tweet.full_text.match(twitterRegex)
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
  }
  return links
}

export default ({ tweets, profile, likes, dms, checksum }) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Resolving Twitter URLs. This may take a while',
    }).start()

    checkCacheDirectory()
      .then(loadCachedLinks(checksum))
      .then((cachedLinks) => {
        if (cachedLinks) {
          spinner.stopAndPersist({
            symbol: chalk.green('✔️'),
            text: `Loaded ${cachedLinks.length.toLocaleString()} links from cache`,
          })
          resolve(cachedLinks)
          return
        }
        const links = parseExistingLinks({ tweets, dms, likes })
        if (profile.description.website.search(twitterRegex) > -1) {
          spinner.text = `Resolving profile website ${profile.description.website}`
          return fetchProfileWebsite(profile).then((profileWebsite) => {
            links.push(profileWebsite)
            return links
          })
        }
        return links
      })
      .then((links) => {
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
              links[current].display_url = location.replace(
                /http(s?):\/\//g,
                '',
              )
            })
            .catch(() => {})
          setImmediate(() => findTwitterLinks())
        }

        findTwitterLinks()
      })
      .catch((error) => {
        reject(error)
      })
  })

export {
  checkCacheDirectory,
  loadCachedLinks,
  parseExistingLinks,
  fetchProfileWebsite,
}
