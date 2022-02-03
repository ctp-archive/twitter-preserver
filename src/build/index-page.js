import fs from 'fs/promises'

export default (njkEnvironment, { output, manifest, account }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/index.html`,
      njkEnvironment.render('index.njk', {
        account,
        pageTitle: `Archive of ${account.username} `,
        path: '',
        manifest,
      }),
    )
    resolve()
  })
