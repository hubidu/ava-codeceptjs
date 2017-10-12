const { test } = require('ava')
const { inBrowser } = require('../index.js')

process.env.TEST_DEVICE = 'iPhone'

test('apply different device settings', inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')

  await I.applyDeviceSettings()
  await I.say('I am in iphone mode')
  
  await I.applyDeviceSettings('default')
  await I.say('I am in desktop mode')
}))
