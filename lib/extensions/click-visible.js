const ElementNotFound = require('codeceptjs/lib/helper/errors/ElementNotFound');

function assertElementExists(res, locator, prefix, suffix) {
    if (!res) {
        throw new ElementNotFound(locator, prefix, suffix);
    }
}

async function clickVisible(locator, context = undefined) {
  const browser = this.browser

  const res = await this._locateClickable(locator)
  const elemIsDisplayed = await Promise.all(res.map(elem => browser.elementIdDisplayed(elem.ELEMENT)))

  let visibleClickableElement
  res.forEach((elem, i) => elemIsDisplayed[i].value === true ? visibleClickableElement = elem : false)

  if (context) {
      assertElementExists(visibleClickableElement, locator, 'Clickable element', `was not found inside element ${new Locator(context).toString()}`);
  } else {
      assertElementExists(visibleClickableElement, locator, 'Clickable element');
  }
  return browser.elementIdClick(visibleClickableElement.ELEMENT)
}

module.exports = clickVisible
