import Eleventy from '@11ty/eleventy'
import { DateTime } from 'luxon'
import path from 'path'
import autolinker from 'autolinker'
import ellipsize from 'ellipsize'
import isImage from 'is-image'
import allowedIncludes from '../includes.js'
import twitterRegex from './twitter-regex.js'

const dateFormat = DateTime.DATETIME_FULL

export default ({
  templates,
  output,
  style,
  account,
  manifest,
  profile,
  tweets,
  likes,
  resolvedUrls,
  include,
  dms,
  dev,
}) => {
  const elev = new Eleventy(templates, output, {
    quietMode: false,
    config: (eleventyConfig) => {
      if (style) {
        eleventyConfig.addGlobalData('style', style)
      }
      eleventyConfig.addGlobalData('account', account)
      eleventyConfig.addGlobalData('manifest', manifest)
      eleventyConfig.addGlobalData('profile', profile)
      eleventyConfig.addGlobalData(
        'tweets',
        tweets.map((tweet) => tweet.tweet),
      )
      eleventyConfig.addGlobalData('dms', dms)
      eleventyConfig.addGlobalData(
        'likes',
        likes.map(({ like }) => like),
      )

      eleventyConfig.addWatchTarget(`${templates}/*.css`)

      eleventyConfig.addGlobalData(
        'include',
        (() => {
          const items = {}
          allowedIncludes.forEach((item) => {
            items[item] = include.indexOf(item) > -1
          })
          return items
        })(),
      )

      eleventyConfig.addFilter('dateFromISO', (str) => {
        return DateTime.fromISO(str).toLocaleString(dateFormat)
      })

      eleventyConfig.addFilter('profileMediaFile', (str) => {
        const url = str.split('/')
        const file = url.pop()
        return `${file}`
      })

      eleventyConfig.addFilter('mediaUrl', (url, id) => {
        const filename = url.split('/').pop()
        return `media/tweet_media/${id}-${filename}`
      })

      eleventyConfig.addFilter('dateFromTweet', (str) => {
        return DateTime.fromFormat(
          str,
          'EEE MMM d HH:mm:ss ZZZ yyyy',
        ).toLocaleString(dateFormat)
      })

      eleventyConfig.addFilter('twitterUrl', (str) => {
        if (resolvedUrls) {
          const result = resolvedUrls.find(({ url }) => url === str)
          if (result) {
            return result.expanded_url
          }
        }
        return str
      })

      eleventyConfig.addFilter('dmMedia', (url, id, group) => {
        const filename = url.split('/').pop()
        const directory = group
          ? 'direct_messages_group_media'
          : 'direct_messages_media'
        if (isImage(filename)) {
          return `<img src="../media/${directory}/${id}-${filename}" alt=""/>`
        }
        if (url.search('dm_video') > -1) {
          return `<video controls src="../media/${directory}/${id}-${filename}"/>`
        }
      })

      eleventyConfig.addFilter('limitLength', (str, length) =>
        ellipsize(str, length),
      )

      eleventyConfig.addFilter('resolveLinks', (str) => {
        let result = str
        if (!resolvedUrls) {
          return result
        }
        const matches = str.match(twitterRegex)
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

      eleventyConfig.addFilter('autoLink', (str) => autolinker.link(str))

      eleventyConfig.addFilter('limitString', (str) => {})

      eleventyConfig.addFilter('twitterBody', (str, tweet, tweetLinkPrefix) => {
        let result = str
        if (!resolvedUrls) {
          return result
        }
        const matches = str.match(twitterRegex)
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
    },
  })

  if (dev) {
    let startBrowsersync = true
    elev
      .watch()
      .catch((e) => {
        startBrowsersync = false
      })
      .then(function () {
        if (startBrowsersync) {
          elev.serve(8080)
        }
      })
  } else {
    elev
      .write()
      .then(() => {
        resolve()
      })
      .catch((error) => reject(error))
  }
}
