import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'
import fsExist from 'fs.promises.exists'

export default (njkEnvironment, { output, tweets }) =>
  new Promise(async (resolve, reject) => {
    const tasks = []
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Creating Thread pages',
    }).start()
    if (!(await fsExist(`${output}/thread`))) {
      await fs.mkdir(`${output}/thread`)
    }
    tweets.forEach(async ({ tweet }) => {
      if (tweet._threads.length) {
        tasks.push(
          fs.writeFile(
            `${output}/thread/${tweet.id}.html`,
            njkEnvironment.render('thread.njk', {
              pageTitle: `Thread`,
              path: '',
              pathPrefix: '../',
              showThreadLink: false,
              tweets: [
                tweet,
                ...tweets
                  .filter(
                    (childTweet) =>
                      tweet._threads.indexOf(childTweet.tweet.id) > -1,
                  )
                  .map((childTweet) => childTweet.tweet)
                  .reverse(),
              ],
            }),
          ),
        )
      }
    })
    await Promise.all(tasks).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: `Created ${tasks.length.toLocaleString()} Thread pages`,
      })
    })

    resolve()
  })
