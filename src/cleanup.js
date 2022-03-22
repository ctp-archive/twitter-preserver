import fs from 'fs/promises'

export default (path) =>
  new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true, force: true }).then(() => {
      resolve(path)
    })
  })
