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
        // const els = await I.grabHTMLFrom('.result_box.result_box--zero.first_three_results')
        // console.log(els)
        const hist = await I.browser.log('client')
        console.log(hist)
    }
}

module.exports = Check24RechtsschutzPage