import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'
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

  env.addFilter('twitterBody', (str, tweet) => {
    let result = str
    if (resolvedUrls) {
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
              result = result.replace(
                matchSearch,
                `<a href="${target.expanded_url}">${target.display_url}</a>`,
              )
            }
          }
        })
      }
    }

    return result
  })

  env.addFilter('socialCardValue', ({ meta }, type) => {
    if (typeof meta[`og:${type}`] !== 'undefined') {
      return meta[`og:${type}`]
    }
    if (typeof meta[`twitter:${type}`] !== 'undefined') {
      return meta[`twitter:${type}`]
    }
    if (typeof meta[type] !== 'undefined') {
      return meta[type]
    }
    return false
  })

  return env
}
