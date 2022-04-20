import readline from 'readline'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'

export default (output) =>
  new Promise((resolve, reject) => {
    fsExists(output).then((exists) => {
      if (!exists) {
        resolve()
        return
      }
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const askToDelete = () => {
        rl.question(
          `The directory ${output} already exists. Overwrite? (y/n)`,
          (value) => {
            const answer = value.toLowerCase().trim()
            if (['y', 'n'].indexOf(answer) === -1) {
              console.log('Please answer with either "y" or "n"')
              askToDelete()
            }
            if (answer === 'y') {
              fs.rm(output, { recursive: true, force: true })
                .then(() => fs.mkdir(output))
                .then(() => {
                  resolve()
                })
              return
            }
            reject(
              new Error('Output directory exists and will not be deleted.'),
            )
          },
        )
      }
      askToDelete()
    })
  })
