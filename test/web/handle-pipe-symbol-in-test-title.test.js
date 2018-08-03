const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test('it should support a pipe in the test title | { foo: "bar"} ', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
}))
