class SelectInsurancePage {
  constructor(actor) {
    this.I = actor
  }

  async goto() {
    await this.I.amOnPage('/versicherungsordner/vertraege/neu/insurance');
  }

  async seeInsuranceCompanies() {
    await this.I.see('Bei welcher Versicherungsgesellschaft', 'h2.SubHeadline');
    // await I.seeInCurrentUrl('/insurance')
  }

  async enter(insuranceCompany) {
    await this.I.seeElement('.SearchBar-input');
    await this.I.fillField({css: '.SearchBar-input'}, insuranceCompany);
    await this.I.wait(1);
  }

  async seeInsurance(insuranceCompanies) {
    insuranceCompanies.forEach(async insurance => 
        await this.I.see(insurance)
    );
  }

  async select(insuranceCompany) {
    await this.I.waitForText('Bei welcher Versicherungsgesellschaft');
    await this.I.seeInCurrentUrl('/insurance');
    await this.I.fillField('.SearchBar-input', insuranceCompany);
    await this.I.seeElement('.ActionButton');
    await this.I.click(insuranceCompany);
  }

  async selectAddOtherInsurance() {
    await this.I.click('Anderen Versicherer hinzufügen', '.TertiaryButton');
    await this.I.seeElement('.ModalDialog.is-open');
    await this.I.fillField('unknownInsuranceName', 'Meine unbekannte Versicherung');
    await this.I.click('.PrimaryButton');
  }

  async resetSearch() {
    await this.I.click('.SearchBar-crossIcon');
  }

  async showsEmptySearchField() {
    await this.I.seeInField('.SearchBar-input', '')
  }

}

module.exports = SelectInsurancePage

