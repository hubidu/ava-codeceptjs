const { test } = require('ava')
const { inBrowser } = require('../../index.js')

process.env.TEST_DEVICE = 'iPhone'

test('apply different device settings',
inBrowser(async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')

  await I.applyDeviceSettings()
  await I.say('I am in iphone mode')

  await I.applyDeviceSettings('default')
  await I.say('I am in desktop mode')
}))

test('run with mobile emulation when TEST_DEVICE is set',
inBrowser({useMobileEmulation: true}, async (t, I) => {
  await I.amOnPage('https://duckduckgo.com/')
  await I.say('I am in mobile emulation mode (iPhone 6)')
}))
