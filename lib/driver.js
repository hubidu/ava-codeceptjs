const path = require('path')
const fs = require('fs')
const webdriverio = require('webdriverio')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { wrap } = require('./wrap-methods')
const { addExtensions } = require('./add-extensions')

const configFile = path.join(process.cwd(), '_config.js')
let config = {
    host: undefined,
    port: undefined,
    caps: [],
    timeouts: {
        waitForTimeout: 2000
    }
}
if (fs.existsSync(configFile)) {
    config = require(configFile).default
}

const chromeHeadless = {
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

module.exports = () => {
    const wdioInstance = new WebDriverIO({
                host: config.host || 'localhost',
                port: config.port || 4444,
                url: 'not important but non empty',  // Not important set in test
                browser: 'chrome', // TODO Should be configurable
                // smartWait: 5000, // TODO Try this
                waitForTimeout: (config.timeouts && config.timeouts.waitForTimeout)? config.timeouts.waitForTimeout : 5000,
                // windowSize: 'maximize', // TODO does not seem to work with chrome headless "automation error"

                 desiredCapabilities: config.caps.indexOf('chrome-headless') > -1 ? chromeHeadless : {}
    }, WebDriverIO)

    return addExtensions(wdioInstance)
}