const { test } = require('ava')
const { inApp } = require('../../index.js')

const opts = {
}

const byResourceId = (resid) => `//*[contains(@resource-id, "${resid}")]`
const byIdTextContains = (id, txt) => `android=new UiSelector().resourceId("${id}").textContains("${txt}")`
const byClass = clazz => `android=new UiSelector().className("${clazz}")`

test('run the check24 app',
inApp(opts, async (t, I) => {
  await I.seeAppIsInstalled('de.check24.android.vc.alpha');

  await I.browser.waitForVisible(byResourceId('de.check24.check24:id/product_header'), 25000)
  await I.see('Versicherungen', byResourceId('de.check24.check24:id/product_header'))
  // await I.see('Alle Vergleiche', byResourceId('de.check24.check24:id/buttonTitleTextView'))
  await I.browser.click(byIdTextContains('de.check24.check24:id/product_header', 'Versicherungen'))
  await I.saveScreen('1.png')

  await I.wait(1)
  // await I.browser.touchPerform({
  //   action: 'press',
  //   options: {
  //     x: 0,
  //     y: 250
  //   }
  // })
  await I.browser.touchAction([
    { action: 'press', x: 200, y: 0 },
    { action: 'moveTo', x: 200, y: 0 },
    { action: 'release' },
  ])

  await I.saveScreen('2.png')
  await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/productTitle', 'Versicherungscenter'), 5000)
  await I.browser.click(byIdTextContains('de.check24.check24:id/productTitle', 'Versicherungscenter'))
  await I.saveScreen('3.png')

  await I.saveScreen('4.png')
}))
