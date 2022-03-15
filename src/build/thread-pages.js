import fs from 'fs/promises'
import fsExist from 'fs.promises.exists'

export default (njkEnvironment, { output, tweets }) =>
  new Promise(async (resolve, reject) => {
    const tasks = []
    if (!(await fsExist(`${output}/thread`))) {
      await fs.mkdir(`${output}/thread`)
    }
    tweets.forEach(async ({ tweet }) => {
      if (tweet._threads.length) {
        tasks.push(
          fs.writeFile(
            `${output}/thread/${tweet.id}.html`,
            njkEnvironment.render('tweets.njk', {
              pageTitle: `Thread`,
              path: '',
              homePath: '../../index.html',
              tweets: [
                tweet,
                ...tweets
                  .filter(
                    (childTweet) =>
                      tweet._threads.indexOf(childTweet.tweet.id) > -1,
                  )
                  .sort((a, b) => {
                    parseInt(a.tweet.id) > parseInt(b.tweet.id) ? -1 : 1
                  })
                  .map((childTweet) => childTweet.tweet),
              ],
            }),
          ),
        )
      }
    })
    await Promise.all(tasks)

    resolve()
  })
