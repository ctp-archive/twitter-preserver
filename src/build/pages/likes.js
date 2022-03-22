import fs from 'fs/promises'

export default (njkEnvironment, { output, likes }) =>
  fs.writeFile(
    `${output}/likes.html`,
    njkEnvironment.render('likes.njk', {
      pageTitle: 'Likes',
      homePath: '../index.html',
      pathPrefix: '',
      path: '',
      likes: likes.map(({ like }) => like),
    }),
  )
