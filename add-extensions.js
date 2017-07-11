const path = require('path')

function grabElementsFrom(sel) {
    const browser = this.browser

    return browser.elements(sel)
}

function saveScreenshotFullscreen(filePath) {
    const browser = this.browser

    return browser.saveViewportScreenshot(path.join(global.output_dir, filePath))
}

function saveElementScreenshot(filePath, sel) {
    const browser = this.browser

    return browser.saveViewportScreenshot(path.join(global.output_dir, filePath), sel)
}

function getSource() {
    const browser = this.browser
    return browser.getSource()   
}

function saveScreen(fullPath) {
    const browser = this.browser

    return browser.saveViewportScreenshot(fullPath)
}

/**
 * Say does nothing, but there are some actions
 */
function say(txt) {
    return Promise.resolve(txt)
}

/**
 * Quick and dirty try to highlight elements on a page
 */
function highlightElement(sel) {
    const browser = this.browser

    return browser.execute(function(sel) {
        var xx = document.querySelectorAll(sel);
        for (var i = 0; i < xx.length; i++) {
                xx[i].style.border = "2px solid red";
                xx[i].style['background-color'] = "yellow";
        }
    }, sel)
}

const addExtensions = (actor) =>
    Object.assign(actor, {
        grabElementsFrom,
        saveScreenshotFullscreen,
        saveElementScreenshot,
        getSource,
        saveScreen,
        say,
        highlightElement
    })

module.exports = {
    addExtensions
}