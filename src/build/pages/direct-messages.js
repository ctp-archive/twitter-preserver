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
        dms: dms
          .filter(
            (dm) =>
              dm.dmConversation.messages.filter(
                (message) => typeof message.messageCreate !== 'undefined',
              ).length,
          )
          .map((dm) => {
            const message = dm.dmConversation.messages.filter(
              (message) => typeof message.messageCreate !== 'undefined',
            )
            const length = message.length

            return {
              ...message.pop().messageCreate,
              _messageCount: length,
              id: dm.dmConversation.conversationId,
              _isGroup: dm.dmConversation._isGroup || false,
            }
          })
          .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
      }),
    )
    resolve()
  })
