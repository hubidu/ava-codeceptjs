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
    if (!fullPath) throw new Error('Expected to get a full screenshot path')
    const browser = this.browser

    return browser.saveScreenshot(fullPath)
}

function saveScreenshot(fileName) {
    const browser = this.browser

    return browser.saveScreenshot(path.join(this.outputDir, fileName))
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
function highlightElement(sel, text, isError = false) {
    const browser = this.browser

    return browser.execute(function (sel, text, isError) {
        // var $text = document.createElement('div');
        // $text.style.position = 'absolute';
        // // $text.style.top = '-1em';
        // $text.style['z-index'] = 1000;
        // $text.style['font-style'] = 'bold';
        // $text.appendChild(document.createTextNode('SDFSDF SDF SDF SDFSD FSDA FSDF SDA FSD FASDA Fdfas'));
        // document.body.appendChild($text);
        var color1 = isError ? 'red' : 'Teal';
        var color2 = isError ? 'orange' : 'LightGreen';

        var xx = document.querySelectorAll(sel);
        for (var i = 0; i < xx.length; i++) {
                xx[i].style.border = "2px dashed " + color1;
                xx[i].style['background-color'] = "LightGreen " + color2;

                if (text) xx[i].appendChild(document.createTextNode(text));
        }

    }, sel, text, isError)
}

function displayBoxGrid() {
    const browser = this.browser

    return browser.execute(function() {
        var css = '* { border: 1px solid rgba(0, 0, 0, 0.2); }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    })
}

const addExtensions = (actor) =>
    Object.assign(actor, {
        grabElementsFrom,
        saveScreenshotFullscreen,
        saveElementScreenshot,
        getSource,
        saveScreen,
        saveScreenshot,
        say,
        highlightElement,
        displayBoxGrid
    })

module.exports = {
    addExtensions
}