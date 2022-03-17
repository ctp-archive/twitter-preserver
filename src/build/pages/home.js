import fs from 'fs/promises'

export default (njkEnvironment, { output, verified }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/index.html`,
      njkEnvironment.render('index.njk', {
        pageTitle: 'Twitter archive',
        path: '',
        verified,
      }),
    )
    resolve()
  })
