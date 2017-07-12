'use strict';

module.exports = I => {
    return {

        async openGitHub() {
            I.amOnPage('https://github.com');
        }

        // insert your locators and methods here
    }
}