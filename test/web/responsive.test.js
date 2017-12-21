const { test } = require('ava')
const { inBrowser } = require('../../index.js')

const Devices = [
  { id: 'mobile', resolution: ['380', '1000'] },
  { id: 'desktop', resolution: ['1280', '1000'] }
]

for (let device of Devices) {
  test(`[${device.id}] run on multiple devices`, inBrowser(async (t, I) => {
    await I.resizeWindow(device.resolution[0], device.resolution[1])

    await I.amOnPage('https://duckduckgo.com/')
    await I.see('DuckDuckGo', '#logo_homepage_link')
    await I.fillField('#search_form_input_homepage', 'github ava')
    await I.click('#search_button_homepage')
    await I.see('GitHub - avajs/ava: Futuristic JavaScript test runner', 'h2.result__title')
  }))
}

