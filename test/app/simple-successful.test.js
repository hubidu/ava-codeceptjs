const { test } = require('ava')
const { inApp } = require('../../index.js')

const opts = {}

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

  // Einloggen
  await I.waitForVisible(s.homeScreen, 25)

  await I.click('Profil')
  await I.click('anmelden')
  await I.click('mit E-Mail-Adresse anmelden')

  await I.click(s.buttonNoneOfAbove) // Google Smart Lock alert might show

  await I.fillField(s.userNameField, 'app-testing@check24.de')
  await I.fillField(s.passwordField, 'AppTesting')
  await I.click(s.anmeldenButton)
  // await I.see(s.profileIcon)

  await I.click('Center')
  await I.click('Ihr digitaler Versicherungsordner', '#de.check24.check24:id/subTitleTextView')

  const onboardingDlgShown = await I.isVisible(s.closeButton)
  if (onboardingDlgShown) await I.click(s.closeButton)

  // Existierenden Vertrag entfernen
  const hasActivities = await I.isVisible('Bearbeiten')
  if (hasActivities) {
    await I.click('Bearbeiten')
    await I.click('#de.check24.check24:id/delete_button') // Trash icon
    await I.click('Entfernen', '#android:id/button2') // Bestätige
    await I.swipe('.android.widget.TextView', 0, -1000)

    await I.click('weiteren Vertrag hinzufügen')
  } else {
    await I.click('jetzt ersten Vertrag hinzufügen')
  }

  // Produktauswahl
  await I.click('Gesetzliche Krankenversicherung')
  await I.click('AGIDA')

  const policyholderExists = await I.isVisible('Versicherungsnehmer angeben')
  if (policyholderExists) {
    await I.click('Max Pecu')
  } else {
    await I.say('I fill the policyholder form')
    await I.click('Herr', '#de.check24.check24:id/mr_radio_btn')
    await I.fillField('#de.check24.check24:id/first_name_edit_field #de.check24.check24:id/value', 'Max')
    await I.browser.hideDeviceKeyboard()
    await I.fillField('#de.check24.check24:id/last_name_edit_field #de.check24.check24:id/value', 'Pecu')
    await I.browser.hideDeviceKeyboard()
    await I.click('#de.check24.check24:id/birthday_field #de.check24.check24:id/value')
    await I.click('Ok')
    await I.fillField('#de.check24.check24:id/postcode_field #de.check24.check24:id/value', '82256')
    await I.browser.hideDeviceKeyboard()
    await I.click('#de.check24.check24:id/street_name_field #de.check24.check24:id/value')
    await I.click('Abt-Anselm-Str.')
    await I.swipe('#de.check24.check24:id/street_name_field', 0, -1000)
    await I.fillField('#de.check24.check24:id/house_number_field #de.check24.check24:id/value', '12')
    await I.browser.hideDeviceKeyboard()

    await I.click('#de.check24.check24:id/terms_of_use_box')
  }
  await I.click('Krankenkasse hinterlegen')

  await I.swipe('Kfz-Versicherung', 0, -1000)
  await I.click('zum Versicherungscenter')

  await I.see('Gesetzliche Krankenversicherung', '#de.check24.check24:id/activities_product_textview')


  await I.say('Finished')
}))
