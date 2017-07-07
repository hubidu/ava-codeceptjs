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
        await I.click('a#c24-input1-submitbutton')
    }

    async seeInsurances(numberOfElements) {
        await I.waitForText('Ihr Rechtsschutz-Vergleich')
        await I.waitForElement('div.consultant_pictureContainer')
        await I.seeNumberOfElements('div.result_box', numberOfElements)
    }
}

module.exports = Check24RechtsschutzPage