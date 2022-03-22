import assert from 'assert'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import cleanCache from '../src/clean-cache.js'

describe('Clean cache', () => {
  it('removes cache directories', () =>
    fs
      .mkdir('./.cache', { recursive: true })
      .then(() => fsExists('./.cache'))
      .then((exists) => {
        assert.ok(exists)
        return cleanCache()
      })
      .then(fsExists('./.cache'))
      .then((exists) => {
        assert.ok(!exists)
      }))
})
