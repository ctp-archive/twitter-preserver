import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'
import path from 'path'
import autolinker from 'autolinker'
import ellipsize from 'ellipsize'
import allowedIncludes from '../includes.js'

const dateFormat = DateTime.DATETIME_FULL

const twitterUrlRegex =
  /http(s?):\/\/t.co\/([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g

export default ({
  templates,
  style,
  include,
  account,
  manifest,
  profile,
  resolvedUrls,
}) => {
  const env = nunjucks.configure(templates)

  env.addGlobal('style', style)
  env.addGlobal('account', account)
  env.addGlobal('manifest', manifest)
  env.addGlobal('profile', profile)

  env.addGlobal(
    'include',
    (() => {
      const items = {}
      allowedIncludes.forEach((item) => {
        items[item] = include.indexOf(item) > -1
      })
      return items
    })(),
  )

  env.addFilter('dateFromISO', (str) => {
    return DateTime.fromISO(str).toLocaleString(dateFormat)
  })

  env.addFilter('profileMediaFile', (str) => {
    const url = str.split('/')
    const file = url.pop()
    return `${file}`
  })

  env.addFilter('mediaUrl', (url, id) => {
    const filename = url.split('/').pop()
    return `media/tweet_media/${id}-${filename}`
  })

  env.addFilter('dateFromTweet', (str) => {
    return DateTime.fromFormat(
      str,
      'EEE MMM d HH:mm:ss ZZZ yyyy',
    ).toLocaleString(dateFormat)
  })

  env.addFilter('twitterUrl', (str) => {
    if (resolvedUrls) {
      const result = resolvedUrls.find(({ url }) => url === str)
      if (result) {
        return result.expanded_url
      }
    }
    return str
  })

  env.addFilter('limitLength', (str, length) => ellipsize(str, length))

  env.addFilter('resolveLinks', (str) => {
    let result = str
    if (!resolvedUrls) {
      return result
    }
    const matches = str.match(twitterUrlRegex)
    if (matches) {
      matches.forEach((match) => {
        const matchSearch = new RegExp(match, 'g')
        const target = resolvedUrls.find(({ url }) => url === match)
        if (target) {
          result = result.replace(
            matchSearch,
            `<a href="${target.expanded_url}">${target.display_url}</a>`,
          )
        }
      })
    }

    return result
  })

  env.addFilter('autoLink', (str) => autolinker.link(str))

  env.addFilter('limitString', (str) => {})

  env.addFilter('twitterBody', (str, tweet, tweetLinkPrefix) => {
    let result = str
    if (!resolvedUrls) {
      return result
    }
    const matches = str.match(twitterUrlRegex)
    if (matches) {
      matches.forEach((match) => {
        const matchSearch = new RegExp(match, 'g')
        const target = resolvedUrls.find(({ url }) => url === match)
        if (target) {
          /*
           *  Remove URLs that point to the current Tweet's media files.
           */
          if (
            typeof tweet.entities.media !== 'undefined' &&
            tweet.entities.media.filter(
              (media) => media.expanded_url === target.expanded_url,
            ).length
          ) {
            result = result.replace(matchSearch, '')
          } else {
            if (
              target.expanded_url.search(
                `twitter.com/${account.username}/status/`,
              ) > -1
            ) {
              const urlPath = path.parse(target.expanded_url)
              const name = urlPath.name.replace(/\?(.*)/g, '')
              result = result.replace(
                matchSearch,
                `<a href="${tweetLinkPrefix}tweets.html#${name}">[Tweet ${name}]</a>`,
              )
            } else {
              result = result.replace(
                matchSearch,
                `<a href="${target.expanded_url}">${target.display_url}</a>`,
              )
            }
          }
        }
      })
    }

    return result
  })

  return env
}
