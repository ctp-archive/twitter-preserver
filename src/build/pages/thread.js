import fs from 'fs/promises'
import ora from 'ora'
import chalk from 'chalk'
import fsExist from 'fs.promises.exists'

export default (njkEnvironment, { output, tweets }) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Creating Thread pages',
    }).start()
    fsExist(`${output}/thread`)
      .then((exists) => {
        if (!exists) {
          return fs.mkdir(`${output}/thread`)
        }
      })
      .then(() => {
        const tasks = []
        tweets.forEach(async ({ tweet }) => {
          if (tweet._threads.length) {
            tasks.push(
              fs.writeFile(
                `${output}/thread/${tweet.id}.html`,
                njkEnvironment.render('thread.njk', {
                  pageTitle: 'Thread',
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
        Promise.all(tasks).then(() => {
          spinner.stopAndPersist({
            symbol: chalk.green('✔️'),
            text: `Created ${tasks.length.toLocaleString()} Thread pages`,
          })
          resolve()
        })
      })
  })
