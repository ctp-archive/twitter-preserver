import chokidar from 'chokidar'
import build from './build/index.js'
import bs from 'browser-sync'

export default (args) => {
  const { templates, output } = args
  return new Promise(async (resolve, reject) => {
    await build(args)
    const bsServer = bs.create()
    bsServer.init({ server: output, port: 8080, watch: true })
    console.log(`Now serving development at http://localhost:8080`)
    chokidar.watch(templates).on('all', async (event, path) => {
      await build(args)
    })
  })
}
