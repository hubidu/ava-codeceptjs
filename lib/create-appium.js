const debug = require('debug')('ava-codeceptjs')
const path = require('path')
const fs = require('fs')
const Appium = require('codeceptjs/lib/helper/Appium')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { addExtensions } = require('./add-extensions')
const { addAppExtensions } = require('./add-app-extensions')

// Look for config file in current directory
const configFile = path.join(process.cwd(), '_config.app.js')

module.exports = (opts = {}) => {
  const deviceName = process.env.TEST_DEVICE || 'default'
  const isNotDesktop = process.env.TEST_DEVICE && process.env.TEST_DEVICE !== ''

  let DefaultConfig
  let config
  if (fs.existsSync(configFile)) {
    DefaultConfig = require(configFile).default
    config = require(configFile)[deviceName] || DefaultConfig
  }

  const desiredCapabilities = Object.assign({}, config.desiredCapabilities, opts.desiredCapabilities)

  // TODO read that from config
  const waitForTimeout = (config.timeouts && config.timeouts.waitForTimeout) ? config.timeouts.waitForTimeout : 20000
  const appiumInstance = new Appium({
    host: config.host || 'localhost',
    port: config.port || 4723,
    waitForTimeout: waitForTimeout,
    deprecationWarnings: config.deprecationWarnings || false,
    browser: opts.browser,
    platform: desiredCapabilities.platformName,
    desiredCapabilities
  }, Appium)
  appiumInstance.options.waitForTimeout = waitForTimeout / 1000
  debug('Created appium instance', appiumInstance.options)

  // Extend methods
  addAppExtensions(appiumInstance)
  addExtensions(appiumInstance)

  const defaultDeviceSettings = DefaultConfig.deviceSettings || {
    type: 'android', // TODO Determine that from config
    width: 1900,
    height: 2048
  }
  const deviceSettings = config.deviceSettings || defaultDeviceSettings

  appiumInstance._setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings)

  return appiumInstance
}
