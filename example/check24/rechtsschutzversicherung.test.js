const { test, scenario } = require('ava-codeceptjs')

const RechtsschutzPage = require('./rechtsschutz.page')

test('Find a Rechtsschutzversicherung', async t => {
    const { I } = t.context

    await t.on(RechtsschutzPage, async I => {
        await I.goThere()
        await I.clickOnJetztVergleichen()
        await I.clickOnErgebnisseAnzeigen()
        await I.seeInsurances(29)
        await I.selectInsurances(3)
        await I.clickOnVergleichen()
        await I.seeVergleichsErgebnis()
    })
})
