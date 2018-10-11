const { test } = require('ava')
const { inBrowser } = require('../../index.js')

test('it should search for ava-codeceptjs on duckduckgo and verify the result', inBrowser(async ({step}, I) => {
  const newData = {
    street: 'Altostr.',
    houseNumber: '12a',
    areaCode: '81245',
    city: 'München',
  }

  step  (`I go to the duckduckgo page`)
  await I.amOnPage('https://duckduckgo.com/')
  await I.see('DuckDuckGo', '#logo_homepage_link')

  step  (`I search for "ava" on "github"`)
  await I.fillField('#search_form_input_homepage', 'github ava')
  await I.click('#search_button_homepage')
  await I.wait(1)

  step  (`I see the ava github repo in the results`)
  await I.see('Futuristic JavaScript test runner', 'h2.result__title')
}))
