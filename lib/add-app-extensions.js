const debug = require('debug')('ava-codeceptjs')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')

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

  async function swipe(locator, xoffset, yoffset, speed = 1000) {
    if (this.isWeb) throw new Error('Not supported in web')
    return this.browser.swipe(parseLocator(locator), xoffset, yoffset, speed);
  }

  return Object.assign(actor, {
    isVisible,
    waitForVisible,
    waitForElement,
    click,
    see,
    fillField,
    swipe
  })
}

module.exports = {
  addAppExtensions
}
