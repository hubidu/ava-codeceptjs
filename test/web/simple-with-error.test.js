const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test.failing('it should go to duckduckgo and look for a text in an element which whill be different (therefore it will fail)',
inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  await I.see('DuckDuckFoo', '#logo_homepage_link')
}))
