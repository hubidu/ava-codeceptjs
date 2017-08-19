const { test } = require('ava')
const { inBrowser } = require('../index.js')

test.failing('run in browser and produce a code excerpt on error as well as an error screenshot', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  await I.see('DuckDuckFoo', '#logo_homepage_link')
}))