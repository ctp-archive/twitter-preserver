import fs from 'fs/promises'
import pdf from 'html-pdf'
import fg from 'fast-glob'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'

export default ({ output }) =>
  new Promise((resolve, reject) => {
    const spinner = ora({
      spinner: 'boxBounce',
      text: 'Generating PDF files',
    }).start()

    fg([`${output}/**.html`, `${output}/*/**.html`]).then((files) => {
      Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const filePath = path.resolve(output)
              fs.readFile(file)
                .then((content) => content.toString())
                .then((html) => {
                  spinner.text = `Processing ${file}`
                  pdf
                    .create(html, {
                      format: 'Letter',
                      base: `file://${filePath}/`,
                      localUrlAccess: true,
                    })
                    .toFile(
                      `${output}/pdf/${file
                        .replace(output, '')
                        .replace('.html', '.pdf')}`,
                      function (error) {
                        if (error) {
                          reject(error)
                          return
                        }
                        resolve()
                      },
                    )
                })
            }),
        ),
      )
        .then(() => {
          spinner.stopAndPersist({
            symbol: chalk.green('✔️'),
            text: `Created ${files.length} PDF files`,
          })
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  })
