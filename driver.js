const webdriverio = require('webdriverio');
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { wrap } = require('./wrap-methods')
const { addExtensions } = require('./add-extensions')

module.exports = () => {
    const wdioInstance = new WebDriverIO({
                url: 'not important but non empty',  // Not important set in test
                browser: 'chrome', // TODO Should be configurable
                chromeOptions: {
                            // run in headless mode
                            args: ['--headless'],
                            // point to your Canary version as it is only supported there
                            // binary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
                        }                
    }, WebDriverIO)

    return addExtensions(wdioInstance)
}