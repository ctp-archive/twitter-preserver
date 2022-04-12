import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import resolveUrls from './resolve-urls.js'
import copyMedia from './copy-media.js'
import addTweetThreads from './tweet-threads.js'
import crypto from 'crypto'
import eleventy from './eleventy.js'

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

export default ({ source, templates, output, include, expandUrls, dev }) =>
  new Promise((resolve, reject) => {
    const files = {}
    checkArchive(source)
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
        let dms = []

        if (include.indexOf('dms') > -1) {
          dms = [...dms, ...files.directMessages]
        }

        if (include.indexOf('group-dms') > -1) {
          dms = [...dms, ...files.groupDirectMessages]
        }

        addTweetThreads(files.tweets, files.account.accountId)

        eleventy({
          templates,
          output,
          ...files,
          include,
          resolvedUrls,
          dms,
          dev,
        }).then(() => {
          resolve(source)
        })
      })
      .catch((error) => reject(error))
  })

export { checkArchive }
