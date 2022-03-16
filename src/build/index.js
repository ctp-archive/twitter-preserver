import ora from 'ora'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import indexPage from './index-page.js'
import tweetsPage from './tweets.js'
import threadPages from './thread-pages.js'
import resolveUrls from './resolve-urls.js'
import nunjucks from './nunjucks-environment.js'
import copyMedia from './copy-media.js'
import addTweetThreads from './tweet-threads.js'
import addTweetSocialCards from './tweet-social-card.js'
import crypto from 'crypto'
import { DateTime } from 'luxon'

const extractJson = (contents) =>
  JSON.parse(contents.replace(/window.[(A-Za-z0-9\.\_]* = /, ''))

const tweetDate = (date) =>
  DateTime.fromFormat(date, 'EEE MMM d HH:mm:ss ZZZ yyyy').valueOf()

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

    const profile = await fs
      .readFile(`${source}/data/profile.js`)
      .then((contents) => extractJson(contents.toString())[0].profile)

    const tweets = await fs
      .readFile(`${source}/data/tweet.js`)
      .then((contents) => extractJson(contents.toString()))
      .then((tweets) =>
        tweets.sort((a, b) =>
          tweetDate(a.tweet.created_at) > tweetDate(b.tweet.created_at)
            ? -1
            : 1,
        ),
      )

    addTweetThreads(tweets, account.accountId)

    let resolvedUrls = false
    if (expandUrls) {
      resolvedUrls = await resolveUrls({ tweets, profile, checksum })
      addTweetSocialCards(tweets, resolvedUrls)
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
    await indexPage(njkEnvironment, { output, templates })

    if (include.indexOf('tweets') > -1) {
      await tweetsPage(njkEnvironment, {
        output,
        templates,
        tweets,
      })
      await threadPages(njkEnvironment, {
        output,
        templates,
        tweets,
      })
    }

    resolve(source)
  })
