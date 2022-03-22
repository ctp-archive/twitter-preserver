import assert from 'assert'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import cleanCache from '../src/clean-cache.js'

describe('Clean cache', () => {
  const dir = './.test-cache'
  it('removes cache directories', () =>
    fs
      .mkdir(dir, { recursive: true })
      .then(() => fsExists(dir))
      .then((exists) => {
        assert.ok(exists)
        return cleanCache(dir)
      })
      .then(fsExists(dir))
      .then((exists) => {
        assert.ok(!exists)
      }))
})
