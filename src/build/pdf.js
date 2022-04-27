import fs from 'fs/promises'
import puppeteer from 'puppeteer'
import fg from 'fast-glob'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'

export default async ({ output }) => {
  const spinner = ora({
    spinner: 'boxBounce',
    text: 'Generating PDF files',
  }).start()

  await fs.mkdir(`${output}/pdf`, { recursive: true })

  const files = await fg([`${output}/**.html`, `${output}/*/**.html`])

  await Promise.all(
    files.map(async (file) => {
      //const filePath = path.resolve(output)
      const browser = await puppeteer.launch({
        headless: true,
      })
      const page = await browser.newPage()
      const html = await (await fs.readFile(file)).toString()
      spinner.text = `Processing ${file}`
      await page.setContent(html.toString(), {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForSelector('body')
      await page.pdf({
        format: 'Letter',
        path: `${output}/pdf/${file
          .replace(output, '')
          .replace('.html', '.pdf')}`,
      })
      await browser.close()
    }),
  )
  spinner.stopAndPersist({
    symbol: chalk.green('✔️'),
    text: `Created ${files.length} PDF files`,
  })
}
