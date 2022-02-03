import fs from 'fs/promises'

export default (njkEnvironment, { output, account, tweets }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/tweets.html`,
      njkEnvironment.render('tweets.njk', {
        account,
        pageTitle: `Tweets of ${account.username} `,
        path: '',
        tweets: tweets.map(tweet => tweet.tweet)
      })
    )
    resolve()
  })
