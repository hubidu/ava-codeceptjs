const { test } = require('ava')
const { inBrowser } = require('../index.js')

// ava todo won't work since it does not allow a test method
// test.todo('Implement this exciting test case')

test('A successful after each hook should not overshadow a failing test', 
inBrowser({teardown: false}, async (t, I) => {
    await I.amOnPage('https://duckduckgo.com/')
    await I.see('DuckDuckFoo', '#logo_homepage_link')
}))

test.afterEach.always(
inBrowser(async (t, I) => {
    console.log('Executing after each')
    await I.see('DuckDuckGo', '#logo_homepage_link')
}))