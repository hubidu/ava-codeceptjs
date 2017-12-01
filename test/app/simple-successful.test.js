const { test } = require('ava')
const { inApp } = require('../../index.js')

const opts = {}

const byResourceId = (resid) => `//*[contains(@resource-id, "${resid}")]`
const byIdTextContains = (resid, txt) => `android=new UiSelector().resourceId("${resid}").text("${txt}")`
const byTextContains = (resid, txt) => `android=new UiSelector().text("${txt}")`
// const byIdTextContains = (id, txt) => `android=new UiSelector().resourceId("${id}").textContains("${txt}")`
const byClass = clazz => `android=new UiSelector().className("${clazz}")`


test('run the check24 app',
inApp(opts, async (t, I) => {
  const s = {
    homeScreen: '#de.check24.check24:id/product_header',
    buttonNoneOfAbove: '#com.google.android.gms:id/cancel',
    userNameField: '#de.check24.check24:id/email_input_field #de.check24.check24:id/input_edit_text',
    passwordField: '#de.check24.check24:id/password_input_field #de.check24.check24:id/input_edit_text',
    anmeldenButton: '#de.check24.check24:id/buttonTitleTextView',
    profileIcon: '#de.check24.check24:id/profileIconLayout',
    closeButton: '#de.check24.check24:id/close_btn'
  }
  // await I.seeAppIsInstalled('de.check24.android.vc.alpha');

  // await I.say('I wait till i see the home screen')
  // await I.browser.waitForVisible(byResourceId('de.check24.check24:id/product_header'), 25000)
  // await I.see('#de.check24.check24:id/product_header')

  await I.say('Waiting for home screen')
  await I.waitForVisible(s.homeScreen, 25)

  await I.click('Profil')
  await I.click('anmelden')
  await I.click('mit E-Mail-Adresse anmelden')

  await I.click(s.buttonNoneOfAbove) // Google Smart Lock alert might show

  await I.fillField(s.userNameField, 'app-testing@check24.de')
  await I.fillField(s.passwordField, 'AppTesting')
  await I.click(s.anmeldenButton)
  await I.see(s.profileIcon)

  await I.click('Center')
  await I.see('Versicherungscenter', '#de.check24.check24:id/menuHeader')
  await I.click('Ihr digitaler Versicherungsordner', '#de.check24.check24:id/subTitleTextView')

  const onboardingDlgShown = await I.isVisible(s.closeButton)
  if (onboardingDlgShown) await I.click(s.closeButton)

  await I.see('Verträge', '#de.check24.check24:id/title')
  await I.click('jetzt ersten Vertrag hinzufügen')
  await I.click('Gesetzliche Krankenversicherung')
  await I.click('AGIDA')
  await I.click('Herr', '#de.check24.check24:id/mr_radio_btn')
  await I.fillField('#de.check24.check24:id/first_name_edit_field #de.check24.check24:id/value', 'Max')
  await I.fillField('#de.check24.check24:id/last_name_edit_field #de.check24.check24:id/value', 'Pecu')

  // await I.say('I open menu')
  // await I.click('.android.widget.ImageButton')
  // console.log(await I.grabCurrentActivity())

  // await I.say('I click anmelden')
  // await I.wait(3)
  // await I.click('.android.widget.ImageButton')
  // console.log(await I.grabCurrentActivity())

  // await I.click('mit E-Mail-Adresse anmelden')
  // console.log(await I.grabCurrentActivity())

  // const res = await I.browser.element(byIdTextContains('de.check24.check24:id/product_header', 'Versicherungen'))
  // await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/product_header', 'Versicherungen'))

  // await I.say('I click Versicherungen')
  // await I.browser.click(byIdTextContains('de.check24.check24:id/product_header', 'Versicherungen'))

  // await I.say('I wait for the Versicherungen menu')
  // await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/productLayoutTitle', 'Versicherungen'), 5000)


  // await I.say('I am scrolling doooown')
  // // await I.swipeUp('//*[contains(@resource-id,"de.check24.check24:id/plugin_holder_fragment_container")]') // manchmal klappt das RunterScrollen hier nicht
  // await I.browser.swipeUp('//*[contains(@resource-id,"de.check24.check24:id/plugin_holder_fragment_container")]', -1500)

  // await I.say('I click Versicherungscenter')
  // await I.browser.click(byIdTextContains('de.check24.check24:id/productTitle', 'Versicherungscenter'), 5000)

  // await I.say('I click zum Versicherungscenter')
  // await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/next_btn', 'zum Versicherungscenter'), 5000)
  // await I.browser.click(byIdTextContains('de.check24.check24:id/next_btn', 'zum Versicherungscenter'))

  // await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/buttonTitleTextView', 'mit E-Mail-Adresse anmelden'), 5000)
  // await I.say('I click mit Email Adresse anmelden')
  // await I.browser.click(byIdTextContains('de.check24.check24:id/buttonTitleTextView', 'mit E-Mail-Adresse anmelden'))

  // await I.browser.waitForVisible(byResourceId('de.check24.check24:id/email_input_field'), 5000)
  // await I.fillField('#de.check24.check24:id/email_input_field', 'stefan.huber@check24.de')
  // await I.fillField('#de.check24.check24:id/password_input_field', 'check#24')
  // await I.click('anmelden')

  await I.say('Finished')
  // await I.browser.removeApp('de.check24.check24')
  // await I.browser.click(byIdTextContains('de.check24.check24:id/product_header', 'Versicherungen'))
  // await I.saveScreen('1.png')

  // await I.wait(1)

  // await I.saveScreen('2.png')
  // await I.browser.waitForVisible(byIdTextContains('de.check24.check24:id/productTitle', 'Versicherungscenter'), 5000)
  // await I.browser.click(byIdTextContains('de.check24.check24:id/productTitle', 'Versicherungscenter'))
  // await I.saveScreen('3.png')

  // await I.saveScreen('4.png')
}))
