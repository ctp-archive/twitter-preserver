import fs from 'fs/promises'
import fsExist from 'fs.promises.exists'
import ora from 'ora'
import chalk from 'chalk'
import { Parser } from 'json2csv'

export default (
  njkEnvironment,
  { output, account, include, tweets, dms, likes },
) =>
  new Promise(async (resolve, reject) => {
    const tasks = []
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Generating download files',
    }).start()

    if (!(await fsExist(`${output}/download`))) {
      await fs.mkdir(`${output}/download`)
    }

    tasks.push(
      fs.writeFile(
        `${output}/download.html`,
        njkEnvironment.render('download.njk', {
          pageTitle: `Download`,
          path: '',
        }),
      ),
    )

    if (include.indexOf('tweets') > -1) {
      tasks.push(
        fs.writeFile(
          `${output}/download/tweets.json`,
          JSON.stringify(tweets, null, 2),
        ),
      )

      const parser = new Parser({
        fields: [
          'id',
          'created_at',
          'link',
          'text',
          'favorite_count',
          'retweet_count',
          'parent_thread',
        ],
      })
      const csv = parser.parse(
        tweets.map(({ tweet }) => ({
          id: tweet.id,
          created_at: tweet.created_at,
          link: `https://twitter.com/${account.username}/status/${tweet.id_str}`,
          text: tweet.full_text,
          favorite_count: tweet.favorite_count,
          retweet_count: tweet.retweet_count,
          parent_thread: tweet.parent_thread,
        })),
      )

      tasks.push(fs.writeFile(`${output}/download/tweets.csv`, csv))
    }

    if (include.indexOf('dms') > -1 || include.indexOf('group-dms') > -1) {
      tasks.push(
        fs.writeFile(
          `${output}/download/direct-messages.json`,
          JSON.stringify(dms, null, 2),
        ),
      )
    }

    if (include.indexOf('likes') > -1) {
      tasks.push(
        fs.writeFile(
          `${output}/download/likes.json`,
          JSON.stringify(likes, null, 2),
        ),
      )

      const parser = new Parser({
        fields: ['id', 'text', 'link'],
      })
      const csv = parser.parse(
        likes.map(({ like }) => ({
          id: like.tweetId,
          text: like.fullText,
          link: like.expandedUrl,
        })),
      )

      tasks.push(fs.writeFile(`${output}/download/likes.csv`, csv))
    }

    Promise.all(tasks).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: `Created CSV and JSON download files`,
      })
      resolve()
    })
  })
