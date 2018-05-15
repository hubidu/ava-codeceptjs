const assert = require('assert')
const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test.failing('it should go to duckduckgo and look for a text in an element which whill be different (therefore it will fail)',
inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  await I.see('DuckDuckFoo', '#logo_homepage_link')
}))

test.failing('it should also fail when a standard assertion is thrown directly in the test',
inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  assert.equal('foo', 'bar') // This will create a nodejs AssertionError
  // TODO Currently this will not generate an error screenshot or source code snippet
}))

test.failing('it should fail when a standard assertion error is thrown in a page object',
inBrowser(async ({on}, I) => {
  class SamplePage {
    async willTriggerAnAssertion() {
      assert.equal('foo', 'bar') // Trigger an assertion error intentionally
    }
  }

  await I.amOnPage('https://duckduckgo.com/')
  await on(SamplePage, async I => {
    await I.willTriggerAnAssertion()
  })

}))

