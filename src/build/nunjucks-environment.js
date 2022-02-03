import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'
import allowedIncludes from '../includes.js'

const dateFormat = DateTime.DATETIME_FULL

export default ({ templates, style, include }) => {
  const env = nunjucks.configure(templates)

  env.addGlobal('style', style)

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

  env.addFilter('dateFromTweet', (str) => {
    return DateTime.fromFormat(
      str,
      'EEE MMM d HH:mm:ss ZZZ yyyy',
    ).toLocaleString(dateFormat)
  })

  return env
}
