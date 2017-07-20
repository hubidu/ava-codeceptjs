const { test, scenario } = require('ava-codeceptjs')

const KfzPageModel = require('./kfz.page-model')

// TODO Add a test with quotes
test('Go to the "KFZ page"', async t => {
    const { I } = t.context
    const p = KfzPageModel
  
    await I.amOnPage('http://www.check24.de')
    await I.see('Urlaubsreisen zum Traumpreis', '.c24-home-slide')
    await I.click('#c24-container-2 > div:nth-child(1) > div:nth-child(2) > div.c24-grid-4.alpha.first > div > a > span.c24-title')

    await I.fillField(p.KennzeichenField, 'FFB')
    await I.click(p.TarifeVergleichenButton)
    await I.click(p.FahrzeugscheinCheckbox)
    await I.click(p.WeiterButton)

    // await I.see('Fehlermeldungen', p.ErrorMessage)
    const errorText = await I.grabTextFrom(p.ErrorMessage)
    // TODO Should also get a screenshot here
    t.is(errorText, 'Bitte beachten Sie die Fehlermeldungen bei den weiter unten rot markierten Fragen.')
})

