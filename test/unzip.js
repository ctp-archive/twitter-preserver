//import assert from 'assert'
import unzip from '../src/unzip.js'

describe('Unzip', () => {
  this.timeout(0)
  it('unzips directory', () =>
    unzip('./test/sample.zip').then((result) => {
      console.log(path)
    }))
})
