const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test.failing('run in browser and when encountering an ava assertion take a screenshot', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')

  const expected = 'foo'
  let actual = 'bar'
  t.deepEqual(actual, expected)

  actual = 'baz'
  t.is(actual, expected)
}))
