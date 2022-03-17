import fs from 'fs'

export default (path) =>
  new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true, force: true })
    console.log('Removed temporary directory')
    resolve(path)
  })
