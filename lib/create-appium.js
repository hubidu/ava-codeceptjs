const debug = require('debug')('ava-codeceptjs')
const path = require('path')
const fs = require('fs')
const Appium = require('codeceptjs/lib/helper/Appium')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { addExtensions } = require('./add-extensions')

// Look for config file in current directory
const configFile = path.join(process.cwd(), '_config.app.js')

const addAppExtensions = (actor) => {
  const androidParentChild = (locators, buildFn) => {
    return `${buildFn(locators[0])}.childSelector(${buildFn(locators[1])})`
  }
  const androidById = locator => {
    const parentChild = locator.split(' ')
    if (parentChild.length > 1) return androidParentChild(parentChild, androidById)

    return `new UiSelector().resourceId("${locator.substr(1, locator.length-1)}")`
  }

  const parseLocator = locator => {
    locator = locator.trim()
    if (!locator) return null;

    let res
    if (typeof locator === 'string') {
      if (locator.substr(0, 2) === '//') return locator; // xpath
      if (locator[0] === '~') return locator;
      if (locator.indexOf('android=') === 0) {return locator;} // specific android selector
      if (locator[0] === '#') { // id selector
        if (actor.platform.toLowerCase() === 'android') {
          res = `android=${androidById(locator)}`
        }
      }
      if (locator[0] === '.') { // class selector
        if (actor.platform.toLowerCase() === 'android') {
          res = `android=new UiSelector().className("${locator.substr(1, locator.length-1)}")`
        }
      }

      // if not set so far
      if (!res) {
        if (actor.platform.toLowerCase() === 'android') {
          res = `android=new UiSelector().textContains("${locator}")` // search by text
        }
      }
    }

    debug(`Parsing locator '${locator}' -> '${res}'`)
    return res
  }

  function waitForVisible(locator, sec = null) {
    if (this.isWeb) return WebDriverIO.prototype.waitForVisible.call(this, locator, sec)
    const useLocator = parseLocator(locator)
    return WebDriverIO.prototype.waitForVisible.call(this, useLocator, sec)
  }

  function waitForElement(locator, sec = null) {
    if (this.isWeb) return WebDriverIO.prototype.waitForElement.call(this, locator, sec);
    return WebDriverIO.prototype.waitForElement.call(this, parseLocator(locator), sec);
  }

  function click(button, context) {
    if (this.isWeb) return WebDriverIO.prototype.click.call(this, button, context);

    // On App: Use webdriverio directly
    if (button && context) {
      const locateByIdAndText = `android=new UiSelector().resourceId("${context.substr(1, context.length-1)}").textContains("${button}")`
      // TODO adapt this to ios
      return this.browser.click(locateByIdAndText)
    } else if (button) {
      return this.browser.click(parseLocator(button))
    }
  }

  function see(button, context) {
    if (this.isWeb) return WebDriverIO.prototype.see.call(this, button, context);

    // On App: Use webdriverio directly
    if (button && context) {
      const locateByIdAndText = `android=new UiSelector().resourceId("${context.substr(1, context.length-1)}").textContains("${button}")`
      // TODO adapt this to ios
      return this.browser.waitForVisible(locateByIdAndText)
    } else if (button) {
      return this.browser.waitForVisible(parseLocator(button))
    }
  }

  async function fillField(field, value) {
    if (this.isWeb) return WebDriverIO.prototype.fillField.call(this, field, value);

    // TODO adapt to ios
    const res = await this.browser.element(parseLocator(field))
    if (!res || !res.value) throw new Error(`No such element "${field}"`)
    const elem = res.value
    return this.browser.elementIdClear(elem.ELEMENT).elementIdValue(elem.ELEMENT, value);
  }

  async function isVisible(locator, secs = 1) {
    if (this.isWeb) throw new Error('Not supported in web')

    try {
      await this.browser.waitForVisible(parseLocator(locator), secs * 1000)
      return true
    } catch (_) {}
    return false
  }

  return Object.assign(actor, {
    isVisible,
    waitForVisible,
    waitForElement,
    click,
    see,
    fillField
  })
}


module.exports = (opts = {}) => {
  const deviceName = process.env.TEST_DEVICE || 'default'
  const isNotDesktop = process.env.TEST_DEVICE && process.env.TEST_DEVICE !== ''

  let DefaultConfig
  let config
  if (fs.existsSync(configFile)) {
    DefaultConfig = require(configFile).default
    config = require(configFile)[deviceName] || DefaultConfig
  }

  const desiredCapabilities = config.desiredCapabilities

  // TODO read that from config
  const appiumInstance = new Appium({
    host: config.host || 'localhost',
    port: config.port || 4723,
    waitForTimeout: (config.timeouts && config.timeouts.waitForTimeout) ? config.timeouts.waitForTimeout : 20000,
    deprecationWarnings: config.deprecationWarnings || false,
    platform: desiredCapabilities.platformName,
    desiredCapabilities
  }, Appium)

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
