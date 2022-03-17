import copy from 'recursive-copy'
import fs from 'fs'
import ora from 'ora'
import chalk from 'chalk'

export default ({ source, include, output }) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Copying media',
    }).start()
    const tasks = []
    const directories = ['profile_media']
    if (include.indexOf('tweets') !== -1) {
      directories.push('community_tweet_media')
      directories.push('tweet_media')
    }
    if (include.indexOf('dms') !== -1) {
      directories.push('direct_messages_media')
    }
    if (include.indexOf('group-dms') !== -1) {
      directories.push('direct_messages_group_media')
    }

    directories.forEach(async (directory) => {
      if (!fs.existsSync(`${output}/media/${directory}`)) {
        tasks.push(
          copy(`${source}/data/${directory}`, `${output}/media/${directory}`),
        )
      }
    })
    Promise.all(tasks).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: `Copied ${directories.length} directories of media`,
      })
      resolve()
    })
  })
