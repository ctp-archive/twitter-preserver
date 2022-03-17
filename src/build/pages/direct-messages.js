import fs from 'fs/promises'

export default (njkEnvironment, { output, dms }) =>
  new Promise(async (resolve, reject) => {
    await fs.writeFile(
      `${output}/direct-messages.html`,
      njkEnvironment.render('direct-messages.njk', {
        pageTitle: `Direct messages`,
        homePath: '../index.html',
        pathPrefix: '',
        path: '',
        dms: dms.map((dm) => ({
          ...dm.dmConversation.messages[dm.dmConversation.messages.length - 1]
            .messageCreate,
          id: dm.dmConversation.conversationId,
        })),
      }),
    )
    resolve()
  })
