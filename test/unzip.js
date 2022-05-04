import assert from 'assert'
import fsExists from 'fs.promises.exists'
import unzip from '../src/unzip.js'

describe('Unzip', () => {
  it('passes directories through', (done) => {
    unzip('./test/sample')
      .then((path) => fsExists(`${path}/Your archive.html`))
      .then((exists) => {
        assert.ok(exists)
        done()
      })
  }).timeout(0)

  it('unzips zip files', (done) => {
    unzip('./test/sample.zip')
      .then((path) => fsExists(`${path}/Your archive.html`))
      .then((exists) => {
        assert.ok(exists)
        done()
      })
  }).timeout(0)
})
