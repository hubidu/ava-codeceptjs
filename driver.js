const webdriverio = require('webdriverio');
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { wrap } = require('./wrap-methods')

module.exports = () => {
    const wdioInstance = new WebDriverIO({
                url: 'sdfdfs',
                browser: 'chrome',
                chromeOptions: {
                            // run in headless mode
                            args: ['--headless'],
                            // point to your Canary version as it is only supported there
                            // binary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
                        }                
    }, WebDriverIO)

    return wrap(wdioInstance)
}