const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test.failing('it should terminate when receiving a socket timeout error',
inBrowser(async (t, I) => {
  const err = new Error('BOOM')
  err.type = 'ESOCKETTIMEDOUT'
  throw err
}))
