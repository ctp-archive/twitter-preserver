import fs from 'fs/promises'

export default (njkEnvironment, { output, tweets }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/tweets.html`,
      njkEnvironment.render('tweets.njk', {
        pageTitle: `Tweets`,
        homePath: '../index.html',
        path: '',
        tweets: tweets.map((tweet) => tweet.tweet),
      }),
    )
    resolve()
  })
