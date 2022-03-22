import assert from 'assert'
import help from '../src/help.js'
import includes from '../src/includes.js'

describe('Help text', () => {
  it('has all possible include values', () => {
    assert.ok(help())
    assert.ok(help().search(includes.join(', ')) > -1)
  })
})
