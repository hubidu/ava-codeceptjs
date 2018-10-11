const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test(`sketch a test outline using t.step`,
inBrowser(async ({step}, I) => {
  const url = 'https://duckduckgo.com/'
    step  (`I go to the duckduckgo page`)
    await I.amOnPage(url)
    await I.see('DuckDuckGo', '#logo_homepage_link')

    step ('I search for "github ava"')
    await I.fillField('#search_form_input_homepage', 'github ava')
    await I.click('#search_button_homepage')

    step('I see avajs/ava as first result in search results')
    await I.see('Futuristic JavaScript test runner', 'h2.result__title')
}))
