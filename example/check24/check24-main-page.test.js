const { test, scenario } = require('ava-codeceptjs')

const Check24RechtsschutzPage = require('./check24-rechtsschutz.page')
const Check24KfzPageModel = require('./check24-kfz.page-model')

test.only('Find a Rechtsschutzversicherung', async t => {
    const { I } = t.context

    await t.on(Check24RechtsschutzPage, async I => {
        await I.goThere()
        await I.clickOnJetztVergleichen()
        await I.clickOnErgebnisseAnzeigen()
        await I.seeInsurances(29)
        await I.selectInsurances(3)

        // TODO Extend to select and compare insurances
    })
})

// TODO Add a test with quotes
test('Go to the "KFZ page"', async t => {
    const { I } = t.context
    const p = Check24KfzPageModel
  
    await I.amOnPage('http://www.check24.de')
    await I.see('Urlaubsreisen zum Traumpreis', '.c24-home-slide')
    await I.click('#c24-container-2 > div:nth-child(1) > div:nth-child(2) > div.c24-grid-4.alpha.first > div > a > span.c24-title')

    await I.fillField(p.KennzeichenField, 'FFB')
    await I.click(p.TarifeVergleichenButton)
    await I.click(p.FahrzeugscheinCheckbox)
    await I.click(p.WeiterButton)

    // await I.see('Fehlermeldungen', p.ErrorMessage)
    const errorText = await I.grabTextFrom(p.ErrorMessage)
    t.is(errorText, 'Bitte beachten Sie die Fehlermeldungen bei den weiter unten rot markierten Fragen.')
})

test.skip('Login to Versicherungs-Center', async t => {
    const { I } = t.context
    
    await I.amOnPage('http://www.check24.de')
    await I.moveCursorTo('.c24-nav-button-text')
    await I.click('#c24-header-bottom > div > nav > div > div.c24-nav-button-wrapper.clearfix > div > span')
    await I.click('Versicherungen', '#c24-mainnav')
    await I.click('Versicherungscenter', '#c24-header-bottom > div > nav > div > div.c24-nav-button-wrapper.clearfix > div')
})

