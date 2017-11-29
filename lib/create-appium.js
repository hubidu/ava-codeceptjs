const path = require('path')
const fs = require('fs')
const Appium = require('codeceptjs/lib/helper/Appium')
const { addExtensions } = require('./add-extensions')

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

  const appiumInstance = new Appium({
    host: config.host || 'localhost',
    port: config.port || 4723,
    waitForTimeout: (config.timeouts && config.timeouts.waitForTimeout) ? config.timeouts.waitForTimeout : 5000,
    deprecationWarnings: config.deprecationWarnings || false,
    platform: 'Android',
    desiredCapabilities: {
      appPackage:       'de.check24.check24',
      appActivity:      'de.check24.check24.activities.Check24Activity',
      platformVersion:  '7.0',
      deviceName:       'Galaxy S6'
    }
  }, Appium)

  // Extend methods
  addExtensions(appiumInstance)

  const defaultDeviceSettings = DefaultConfig.deviceSettings || {
    type: 'desktop',
    width: 1900,
    height: 2048
  }
  const deviceSettings = config.deviceSettings || defaultDeviceSettings

  appiumInstance._setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings)

  return appiumInstance
}
