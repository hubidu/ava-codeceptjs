const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test('should confirm test failures by immediate retry', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')

  await I.see('something which is not there')
}))
