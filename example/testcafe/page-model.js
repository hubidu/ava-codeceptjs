const label = 'label';

module.exports = class Page {
    constructor () {
        this.nameInput             = '#developer-name'
        this.triedTestCafeCheckbox = '#tried-test-cafe'
        this.populateButton        = '#populate'
        this.submitButton          = '#submit-button'
        this.results               = '.result-content'
        this.macOSRadioButton      = 'input[type=radio][value=MacOS]'
        this.commentsTextArea      = '#comments'

        this.featureList = [
            'Support for testing on remote devices',
            'Re-using existing JavaScript code for testing',
            'Easy embedding into a Continuous integration system'
        ];

        this.slider = {
            handle: '.ui-slider-handle',
            tick:   '.slider-value'
        };

        this.interfaceSelect       = '#preferred-interface'
    }
}