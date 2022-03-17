import help from '../help.js'
import includes from '../includes.js'

describe('Help text', () => {
  test('has all possible include values', () => {
    expect(help()).toBeTruthy()
    expect(help().search(includes.join(', ')) > -1).toBeTruthy()
  })
})
