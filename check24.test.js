const { test, scenario } = require('./codecept-ava')

const Check24RechtsschutzPage = require('./check24-rechtsschutz.page')
const Check24KfzPageModel = require('./check24-kfz.page-model')

test('Find a Rechtsschutzversicherung', async t => {
    const { I, on } = t.context

    await on(new Check24RechtsschutzPage(I), async I => {
        await I.goThere()
        await I.clickOnJetztVergleichen()
        await I.clickOnErgebnisseAnzeigen()
        await I.seeInsurances(29)
    })
})

test('Go to the KFZ page', async t => {
    const { I } = t.context
    const p = Check24KfzPageModel
  
    await I.amOnPage('http://www.check24.de')
    await I.waitForText('Urlaubsreisen zum Traumpreis')
    await I.click('#c24-container-2 > div:nth-child(1) > div:nth-child(2) > div.c24-grid-4.alpha.first > div > a > span.c24-title')

    await I.fillField(p.KennzeichenField, 'FFB')
    await I.click(p.TarifeVergleichenButton)
    await I.click(p.FahrzeugscheinCheckbox)
    await I.click(p.WeiterButton)

    // await I.see('Fehlermeldungen', p.ErrorMessage)
    const errorText = await I.grabTextFrom(p.ErrorMessage)
    t.is(errorText, 'Bitte beachten Sie die Fehlermeldungen bei den weiter unten rot markierten Fragen.')
})

