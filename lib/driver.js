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
    browser: 'chrome',
    caps: [],
    timeouts: {
        waitForTimeout: 2000
    },

    deviceSettings: {
        type: 'desktop',
        width: 360,
        height: 4096
    },
      
}

// const chromeHeadless = {
//                     browserName: 'chrome',
//                     chromeOptions: {
//                         // binary: '/usr/bin/google-chrome',
//                         args: [
//                             '--headless',
//                             // 'start-maximized', // workaround for maximize problem
//                             // Use --disable-gpu to avoid an error from a missing Mesa
//                             // library, as per
//                             // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
//                             '--disable-gpu',
//                         ],
//                     },
//                 }

module.exports = () => {
    const deviceName = process.env.TEST_DEVICE || 'default'
    if (fs.existsSync(configFile)) {
        config = require(configFile)[deviceName] || require(configFile).default
    }

    const wdioInstance = new WebDriverIO({
        host: config.host || 'localhost',
        port: config.port || 4444,
        url: config.url || 'URL_NOT_SET',  // Not important set in test
        browser: config.browser || 'chrome',
        // smartWait: 5000, // TODO Try this
        waitForTimeout: (config.timeouts && config.timeouts.waitForTimeout) ? config.timeouts.waitForTimeout : 5000,

        desiredCapabilities: config.desiredCapabilities || {}
    }, WebDriverIO)

    // Extend methods
    addExtensions(wdioInstance)

    const defaultDeviceSettings = {
        type: 'desktop',
        width: 1900,
        height: 3096
    }
    const deviceSettings = config.deviceSettings || defaultDeviceSettings

    wdioInstance._setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings)

    return wdioInstance
}