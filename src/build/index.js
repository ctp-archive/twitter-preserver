import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import homePage from './pages/home.js'
import downloadPage from './pages/download.js'
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
  JSON.parse(contents.replace(/window.[(A-Za-z0-9\.\_]* = /, '')) // eslint-disable-line

const checkArchive = (source) =>
  new Promise((resolve, reject) => {
    fsExists(`${source}/Your archive.html`).then((exists) => {
      if (!exists) {
        reject(
          new Error(
            'The provided input directory or ZIP file is not a Twitter archive.',
          ),
        )
        return
      }
      resolve()
    })
  })

const readFileTasks = (templates, source) => [
  { name: 'style', path: `${templates}/style.css` },
  {
    name: 'manifest',
    path: `${source}/data/manifest.js`,
    process: (str) => extractJson(str),
  },
  {
    name: 'account',
    path: `${source}/data/account.js`,
    process: (str) => extractJson(str)[0].account,
  },
  {
    name: 'verified',
    path: `${source}/data/verified.js`,
    process: (str) => extractJson(str)[0].verified,
  },
  {
    name: 'profile',
    path: `${source}/data/profile.js`,
    process: (str) => extractJson(str)[0].profile,
  },
  {
    name: 'tweets',
    path: `${source}/data/tweet.js`,
    process: (str) => extractJson(str),
  },
  {
    name: 'likes',
    path: `${source}/data/like.js`,
    process: (str) => extractJson(str),
  },
  {
    name: 'directMessages',
    path: `${source}/data/direct-messages.js`,
    process: (str) => extractJson(str),
  },
  {
    name: 'groupDirectMessages',
    path: `${source}/data/direct-messages-group.js`,
    process: (str) =>
      extractJson(str).map((message) => {
        message.dmConversation._isGroup = true
        return message
      }),
  },
]

export default ({ source, templates, output, include, expandUrls }) =>
  new Promise((resolve, reject) => {
    const files = {}
    checkArchive(source)
      .then(() => fs.mkdir(output))
      .then(copyMedia({ source, include, output }))
      .then(() => {
        const tasks = []
        readFileTasks(templates, source).forEach((task) => {
          tasks.push(
            new Promise((resolve, reject) => {
              fs.readFile(task.path).then((str) => {
                const value =
                  typeof task.process !== 'undefined'
                    ? task.process(str.toString())
                    : str
                resolve({
                  name: task.name,
                  value,
                })
              })
            }),
          )
        })
        return Promise.all(tasks)
      })
      .then((values) => {
        values.forEach(({ name, value }) => {
          files[name] = value
        })

        const checksum = crypto
          .createHash('sha1')
          .update(JSON.stringify(files.manifest))
          .digest('hex')

        if (expandUrls) {
          return resolveUrls({
            ...files,
            checksum,
          })
        }
        return false
      })
      .then((resolvedUrls) => {
        const njkEnvironment = nunjucks({
          ...files,
          templates,
          include,
          resolvedUrls,
        })

        let dms = []

        if (include.indexOf('dms') > -1) {
          dms = [...dms, ...files.directMessages]
        }

        if (include.indexOf('group-dms') > -1) {
          dms = [...dms, ...files.groupDirectMessages]
        }

        addTweetThreads(files.tweets, files.account.accountId)

        const tasks = [
          homePage(njkEnvironment, { output, ...files }),
          downloadPage(njkEnvironment, {
            output,
            include,
            dms,
            ...files,
          }),
        ]

        if (include.indexOf('tweets') > -1) {
          tasks.push(
            tweetsPage(njkEnvironment, {
              output,
              ...files,
            }),
          )
          tasks.push(
            threadPages(njkEnvironment, {
              output,
              ...files,
            }),
          )
        }

        if (include.indexOf('dms') > -1 || include.indexOf('group-dms') > -1) {
          tasks.push(
            directMessagesPage(njkEnvironment, {
              output,
              templates,
              ...files,
              dms,
            }),
          )
          tasks.push(
            directMessagePages(njkEnvironment, {
              output,
              templates,
              ...files,
              dms,
            }),
          )
        }
        if (include.indexOf('likes') > -1) {
          tasks.push(
            likesPage(njkEnvironment, {
              output,
              templates,
              ...files,
            }),
          )
        }

        Promise.all(tasks).then(() => {
          resolve(source)
        })
      })
      .catch((error) => reject(error))
  })

export { checkArchive }
