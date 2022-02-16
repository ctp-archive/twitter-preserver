import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'
import Autolinker from 'autolinker'
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
        return result.target
      }
    }
    return str
  })

  env.addFilter('twitterBody', (str) => {
    let result = str
    if (resolvedUrls) {
      const matches = str.match(twitterUrlRegex)
      if (matches) {
        matches.forEach((match) => {
          const matchSearch = new RegExp(match, 'g')
          const target = resolvedUrls.find(({ url }) => url === match)
          if (target) {
            result = result.replace(matchSearch, target.target)
          }
        })
      }
    }
    return Autolinker.link(result, { stripPrefix: false })
  })

  return env
}
