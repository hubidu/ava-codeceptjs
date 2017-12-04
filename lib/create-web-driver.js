const debug = require('debug')('ava-codeceptjs')
const path = require('path')
const fs = require('fs')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { addExtensions } = require('./add-extensions')

// Look for config file in current directory
const configFile = path.join(process.cwd(), '_config.js')

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

module.exports = (opts = {}) => {
  const deviceName = process.env.TEST_DEVICE || 'default'
  const isNotDesktop = process.env.TEST_DEVICE && process.env.TEST_DEVICE !== ''

  let DefaultConfig
  let config
  if (fs.existsSync(configFile)) {
    DefaultConfig = require(configFile).default
    config = require(configFile)[deviceName] || DefaultConfig
  }

  const useMobileEmulation = (isNotDesktop && opts.useMobileEmulation) || false

  const chromeOptions = Object.assign({}, config.chromeOptions)
  if (useMobileEmulation) {
    if (!config.deviceSettings) throw new Error('deviceSettings.name must be a mobile device profile name')
    chromeOptions.mobileEmulation = {
      deviceName: config.deviceSettings.name
    }
  }

  const wdioInstance = new WebDriverIO({
    host: config.host || 'localhost',
    port: config.port || 4444,
    url: config.url || 'URL_NOT_SET',  // Not important set in test
    browser: config.browser || 'chrome',
    waitForTimeout: (config.timeouts && config.timeouts.waitForTimeout) ? config.timeouts.waitForTimeout : 20000,
    deprecationWarnings: config.deprecationWarnings || false,
    desiredCapabilities: {
      loggingPrefs: {browser: 'SEVERE', performance: 'SEVERE'},
      chromeOptions
    }
  }, WebDriverIO)

  // Extend methods
  addExtensions(wdioInstance)

  debug('Created WebDriverIO instance', wdioInstance.options)

  const defaultDeviceSettings = DefaultConfig.deviceSettings || {
    type: 'desktop',
    width: 1900,
    height: 2048
  }
  const deviceSettings = config.deviceSettings || defaultDeviceSettings

  wdioInstance._setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings)

  return wdioInstance
}
