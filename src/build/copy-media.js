import copy from 'recursive-copy'
import fsExists from 'fs.promises.exists'
import ora from 'ora'

const sources = {
  profile: 'profile_media',
  tweets: ['community_tweet_media', 'tweet_media'],
  dms: ['direct_messages_media', 'direct_messages_group_media'],
}

export default ({ source, include, output }) =>
  new Promise(async (resolve, reject) => {
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
      directories.push('direct_messages_group_media')
    }
    directories.forEach(async (directory) => {
      if (!(await fsExists(`${output}/media/${directory}`))) {
        tasks.push(
          copy(`${source}/data/${directory}`, `${output}/media/${directory}`),
        )
      }
    })
    await Promise.all(tasks)
    spinner.stop()
    resolve()
  })
