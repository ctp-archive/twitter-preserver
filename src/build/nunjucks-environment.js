import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'

const dateFormat = DateTime.DATETIME_FULL

export default (templates, style) => {
  const env = nunjucks.configure(templates)

  env.addGlobal('style', style)

  env.addFilter('dateFromISO', (str) => {
    return DateTime.fromISO(str).toLocaleString(dateFormat)
  })

  env.addFilter('dateFromTweet', (str) => {
    return DateTime.fromISO(str).toLocaleString(dateFormat)
  })

  return env
}
