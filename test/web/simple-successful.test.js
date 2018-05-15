const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test('it should search for ava-codeceptjs on duckduckgo and verify the result', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  await I.see('DuckDuckGo', '#logo_homepage_link')
  await I.fillField('#search_form_input_homepage', 'github ava')
  await I.click('#search_button_homepage')
  await I.wait(1)
  await I.see('GitHub - avajs/ava: Futuristic JavaScript test runner', 'h2.result__title')
}))
