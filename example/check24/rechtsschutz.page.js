let I

class Check24RechtsschutzPage {
    constructor(actor) {
        I = actor
    }

    async goThere() {
        await I.amOnPage('https://www.check24.de/rechtsschutzversicherung/')
    }

    async clickOnJetztVergleichen() {
        await I.click('jetzt vergleichen')
    }

    async clickOnErgebnisseAnzeigen() {
        await I.click({css: 'a#c24-input1-submitbutton'})
    }

    async seeInsurances(numberOfElements) {
        await I.waitForText('Ihr Rechtsschutz-Vergleich')
        await I.waitForElement('div.consultant_pictureContainer')
        await I.seeNumberOfElements('div.result_box', numberOfElements)
    }

    async selectInsurances(numberOfInsurances) {
        const nth = num => `#c24-content-main > div.c24-cnt-ele > div.c24-grid-9.omega.content_dynamic > div.content_result.clearfix > div:nth-child(${num}) > div.result_box__tabs > div.comparison_link > label`
        for (let i=1; i <= numberOfInsurances; i++) {
            await I.click(nth(i))
        }
    }

    async clickOnVergleichen() {
        await I.click({css: '.c24vv__comparison_bar__compare_tariffs'})
    }

    async seeVergleichsErgebnis() {
        await I.see('Ihr Rechtsschutzversicherungs-Vergleich', 'h1')
    }
}

module.exports = Check24RechtsschutzPage