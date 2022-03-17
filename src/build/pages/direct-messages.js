import fs from 'fs/promises'

export default (njkEnvironment, { output, dms }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/dms.html`,
      njkEnvironment.render('dms.njk', {
        pageTitle: `Direct messages`,
        homePath: '../index.html',
        pathPrefix: '',
        path: '',
        dms: dms.map((dm) => dm.dmConversation),
      }),
    )
    resolve()
  })
