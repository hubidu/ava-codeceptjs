const { test } = require('ava')
const { prepareBrowser, teardownBrowser, inBrowser } = require('../index.js')

test.beforeEach(prepareBrowser(async (t, I) => {
  await I.say('Lets prepare the test')
  await I.amOnPage('https://duckduckgo.com/')
  await I.seeInTitle('Duck')
}))

test('running in browser it should be able to use ava hooks', 
  inBrowser({teardown: false}, async (t, I) => {
    await I.say('Now lets run the test')
    await I.see('DuckDuckGo', '#logo_homepage_link')
    await I.fillField('#search_form_input_homepage', 'github ava')
    await I.click('#search_button_homepage')
  }))

test.afterEach.always(teardownBrowser(async (t, I) => {
  await I.say('Lets clean up now')
  await I.see('GitHub - avajs/ava: Futuristic JavaScript test runner', 'h2.result__title')
}))
