import ora from 'ora'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import homePage from './pages/home.js'
import tweetsPage from './pages/tweets.js'
import directMessagesPage from './pages/direct-messages.js'
import threadPages from './pages/thread.js'
import directMessagePages from './pages/direct-message.js'
import resolveUrls from './resolve-urls.js'
import nunjucks from './nunjucks-environment.js'
import copyMedia from './copy-media.js'
import addTweetThreads from './tweet-threads.js'
import likesPage from './pages/likes.js'
import crypto from 'crypto'

const extractJson = (contents) =>
  JSON.parse(contents.replace(/window.[(A-Za-z0-9\.\_]* = /, ''))

export default ({ source, templates, output, include, expandUrls }) =>
  new Promise(async (resolve, reject) => {
    if (!(await fsExists(`${source}/Your archive.html`))) {
      reject(
        `The provided input directory or ZIP file is not a Twitter archive.`,
      )
      return
    }

    if (!(await fsExists(`${templates}/style.css`))) {
      reject(`The template directory is missing a stylesheet`)
      return
    }

    const style = await (await fs.readFile(`${templates}/style.css`)).toString()

    const manifestContent = await (
      await fs.readFile(`${source}/data/manifest.js`)
    ).toString()

    const checksum = crypto
      .createHash('sha1')
      .update(manifestContent)
      .digest('hex')

    const manifest = extractJson(manifestContent)

    const account = await fs
      .readFile(`${source}/data/account.js`)
      .then((contents) => extractJson(contents.toString())[0].account)

    const verified = await fs
      .readFile(`${source}/data/verified.js`)
      .then((contents) => extractJson(contents.toString())[0].verified)

    const profile = await fs
      .readFile(`${source}/data/profile.js`)
      .then((contents) => extractJson(contents.toString())[0].profile)

    const tweets = await fs
      .readFile(`${source}/data/tweet.js`)
      .then((contents) => extractJson(contents.toString()))

    const likes =
      include.indexOf('likes') > -1
        ? await fs
            .readFile(`${source}/data/like.js`)
            .then((contents) => extractJson(contents.toString()))
        : false

    addTweetThreads(tweets, account.accountId)

    let resolvedUrls = false
    if (expandUrls) {
      resolvedUrls = await resolveUrls({ tweets, profile, likes, checksum })
    }

    await copyMedia({ source, include, output })

    const njkEnvironment = nunjucks({
      templates,
      style,
      include,
      account,
      manifest,
      profile,
      resolvedUrls,
    })

    if (!(await fsExists(output))) {
      await fs.mkdir(output)
    }
    await homePage(njkEnvironment, { output, verified })

    if (include.indexOf('tweets') > -1) {
      await tweetsPage(njkEnvironment, {
        output,
        tweets,
      })
      await threadPages(njkEnvironment, {
        output,
        tweets,
      })
    }
    if (include.indexOf('dms') > -1 || include.indexOf('group-dms') > -1) {
      let dms = []

      if (include.indexOf('dms') > -1) {
        dms = [
          ...dms,
          ...(await fs
            .readFile(`${source}/data/direct-messages.js`)
            .then((contents) => extractJson(contents.toString()))),
        ]
      }

      if (include.indexOf('group-dms') > -1) {
        dms = [
          ...dms,
          ...(
            await fs
              .readFile(`${source}/data/direct-messages-group.js`)
              .then((contents) => extractJson(contents.toString()))
          ).map((message) => {
            message.dmConversation._isGroup = true
            return message
          }),
        ]
      }

      await directMessagesPage(njkEnvironment, {
        output,
        templates,
        dms,
      })
      await directMessagePages(njkEnvironment, {
        output,
        templates,
        account,
        dms,
      })
    }
    if (likes) {
      await likesPage(njkEnvironment, {
        output,
        templates,
        likes,
      })
    }

    resolve(source)
  })
