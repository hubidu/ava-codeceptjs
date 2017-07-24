class Check24RechtsschutzPage {
    constructor(actor) {
        this.I = actor
    }

    async goThere() {
        await this.I.amOnPage('https://www.check24.de/rechtsschutzversicherung/')
    }

    async clickOnJetztVergleichen() {
        await this.I.click('jetzt vergleichen')
    }

    async clickOnErgebnisseAnzeigen() {
        await this.I.click({css: 'a#c24-input1-submitbutton'})
    }

    async seeInsurances(numberOfElements) {
        await this.I.waitForText('Ihr Rechtsschutz-Vergleich')
        await this.I.waitForElement('div.consultant_pictureContainer')
        await this.I.seeNumberOfElements('div.result_box', numberOfElements)
    }

    async selectInsurances(numberOfInsurances) {
        const nth = num => `#c24-content-main > div.c24-cnt-ele > div.c24-grid-9.omega.content_dynamic > div.content_result.clearfix > div:nth-child(${num}) > div.result_box__tabs > div.comparison_link > label`
        for (let i=1; i <= numberOfInsurances; i++) {
            await this.I.click(nth(i))
        }
    }

    async clickOnVergleichen() {
        await this.I.click({css: '.c24vv__comparison_bar__compare_tariffs'})
    }

    async seeVergleichsErgebnis() {
        await this.I.see('Ihr Rechtsschutzversicherungs-Vergleich', 'h1')
    }
}

module.exports = Check24RechtsschutzPage