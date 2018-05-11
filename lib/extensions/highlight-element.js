const highlight = require('bifrost-io/scripts/highlight-element')

/**
 * Quick and dirty try to highlight elements on a page
 */
function _highlightElement(sel, text, isError = false) {
     const browser = this.browser
     return browser.execute(highlight, sel, isError, text)
}

module.exports = {
    _highlightElement,
}
