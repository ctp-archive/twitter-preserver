import fs from 'fs/promises'
import fsExist from 'fs.promises.exists'
import ora from 'ora'
import chalk from 'chalk'

export default (njkEnvironment, { output, account, dms }) =>
  new Promise(async (resolve, reject) => {
    const tasks = []
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Creating Direct Messages pages',
    }).start()

    if (!(await fsExist(`${output}/direct-messages`))) {
      await fs.mkdir(`${output}/direct-messages`)
    }
    dms.forEach(async ({ dmConversation }) => {
      dmConversation.messages = dmConversation.messages
        .reverse()
        .filter((message) => typeof message.messageCreate !== 'undefined')
        .map((conversation) => {
          conversation.isAuthor = conversation.messageCreate
            ? conversation.messageCreate.senderId === account.accountId
            : false
          return conversation
        })
      tasks.push(
        fs.writeFile(
          `${output}/direct-messages/${dmConversation.conversationId}.html`,
          njkEnvironment.render('direct-message.njk', {
            pageTitle: `Direct message`,
            path: '',
            pathPrefix: '../',
            dm: dmConversation,
          }),
        ),
      )
    })
    await Promise.all(tasks).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔️'),
        text: `Created ${tasks.length.toLocaleString()} Direct Message pages`,
      })
    })

    resolve()
  })
