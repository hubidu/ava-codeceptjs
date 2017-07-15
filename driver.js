const webdriverio = require('webdriverio');
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { wrap } = require('./wrap-methods')
const { addExtensions } = require('./add-extensions')

module.exports = () => {
    const wdioInstance = new WebDriverIO({
                url: 'not important but non empty',  // Not important set in test
                browser: 'chrome', // TODO Should be configurable
                // windowSize: 'maximize', // TODO does not seem to work with chrome headless "automation error"

                 desiredCapabilities: {
                    browserName: 'chrome',
                    chromeOptions: {
                        // binary: '/usr/bin/google-chrome',
                        args: [
                            '--headless',
                            // 'start-maximized', // workaround for maximize problem
                            // Use --disable-gpu to avoid an error from a missing Mesa
                            // library, as per
                            // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
                            '--disable-gpu',
                        ],
                    },
                }
    }, WebDriverIO)

    return addExtensions(wdioInstance)
}