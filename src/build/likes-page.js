import fs from 'fs/promises'

export default (njkEnvironment, { output, likes }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/likes.html`,
      njkEnvironment.render('likes.njk', {
        pageTitle: `Likes`,
        homePath: '../index.html',
        pathPrefix: '',
        path: '',
        likes: likes.map(({ like }) => like),
      }),
    )
    resolve()
  })
