import assert from 'assert'
import fs from 'fs/promises'
import fsExists from 'fs.promises.exists'
import cleanup from '../src/cleanup.js'

describe('Cleanup', () => {
  const dir = '/tmp/twitter-archive-test'
  it('removes temporary directory', () =>
    fs
      .mkdir(dir, { recursive: true })
      .then(() => fsExists(dir))
      .then((exists) => {
        assert.ok(exists)
        return cleanup(dir)
      })
      .then(() => fsExists(dir))
      .then((exists) => {
        assert.ok(!exists)
      }))
})
