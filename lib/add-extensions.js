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

    return browser.saveScreenshot(path.join(this._test.outputDir, fileName))
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
function _highlightElement(sel, text, isError = false) {
    const browser = this.browser

    return browser.execute(function (sel, text, isError) {
        var color1 = isError ? 'red' : 'Teal';
        var icon = isError ? '&#10006;' : '&#10004;'

        $text = document.getElementById('ava-codeceptjs-text') || document.createElement('span');
        $text.setAttribute('id', 'ava-codeceptjs-text')
        $text.innerHTML = icon + ' ' + text;

        var newdiv = document.getElementById('ava-codeceptjs')
        if (!newdiv) {
            newdiv = document.createElement('div');
            newdiv.appendChild($text);

            newdiv.style['position'] = 'absolute';
            newdiv.style['background-color'] = color1;
            newdiv.style['color'] = 'white';
            newdiv.style['font-size'] = '10px';
            newdiv.style['font-weight'] = 'bold';
            newdiv.style['padding'] = '1px';
            newdiv.style['z-index'] = '1000';
            newdiv.style.opacity = 0.8;
            newdiv.style['pointer-events'] = 'none'; // be able to click through this element
            newdiv.className += 'ava-codeceptjs'
            newdiv.setAttribute('id', 'ava-codeceptjs')
            document.body.appendChild(newdiv);
        }

        // Find elements matching the given selector
        var xx = document.querySelectorAll(sel);
        // Highlight the first element which was found
        if (xx.length > 0) {
            var element = xx[0];
            var rect = element.getBoundingClientRect();

            newdiv.style.left = rect.left + 'px';
            newdiv.style.top = rect.bottom + 'px';
            newdiv.style.width = (rect.right - rect.left) + 'px';

            element.style.border = "1px solid " + color1;
            // element.style['background-color'] = color2;
        }

    }, sel, text, isError)
}

/**
 * Display a box grid on the page
 */
function _displayBoxGrid() {
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

function _setTestTitle(title) {
    this._test = {
        title: title.replace('beforeEach for ', '')
    }
}

function _createOutputDirIfNecessary() {
    const parseErrorStack = (err) => {
        const ErrorStackParser = require('error-stack-parser')
        try {
            return ErrorStackParser.parse(err)[0]
        } catch (e) {
            console.log('Failed to parse error stack', e, err)
            return ''
        }
    }
    const { createScreenshotDir } = require('./screenshot-utils.js')

    if (this._test && this._test.prefix) return

    const err = new Error()
    err.stack = err.stack.split('\n').splice(3).join('\n') // Make it point to location in test
    const parsed = parseErrorStack(err)

    const { fileName: testFileName } = parsed

    if (!testFileName) return
        
    const testRelPath = path.join('.', testFileName
                            .replace(process.cwd() + path.sep, '')
                            .replace(/\.test\.js/g, '')
                            .replace(/\\/g, ' -- '))

    if (!testRelPath) throw new Error('Expected to extract test file name from stack trace')

    this._test.prefix = testRelPath
    this._test.outputDir = createScreenshotDir(this._test.prefix, this._test.title)
}

/**
 * Store given data to use in report
 */
function _storeForReport(data) {
    if (!this.reportData) this.reportData = []
    this.reportData.splice(0, 0, data)
}

function _getReportData() {
    return this.reportData
}

/*
 * My versions of WebdriverIO methods
 */

function withStrictLocator(locator) {
    if (!locator) return null;
    if (typeof locator !== 'object') return locator;
    let key = Object.keys(locator)[0];
    let value = locator[key];

    locator.toString = () => `{${key}: '${value}'}`;

    switch (key) {
        case 'by':
        case 'xpath':
            return value;
        case 'css':
            return value;
        case 'id':
            return '#' + value;
        case 'name':
            return `[name="${value}"]`;
    }
}

function _waitForVisible(locator, sec = null) {
    let client = this.browser;
    sec = sec || this.options.waitForTimeout;

    return client.waitUntil(function () {
      return client.elements(withStrictLocator(locator)).then(function (res) {
        if (!res.value || res.value.length === 0) {
          return false;
        }

        let commands = [];
        res.value.forEach((el) => commands.push(client.elementIdDisplayed(el.ELEMENT)));
        return client.unify(commands, {
          extractValue: true
        }).then((selected) => {
          if (Array.isArray(selected)) {
            return selected.filter((val) => val === true).length > 0;
          }
          return selected;
        });
      });
    }, sec * 1000, `element (${locator}) still not visible after ${sec} sec`);
}

function _scrollTo(locator, offsetX = 0, offsetY = 0) {
    let client = this.browser;

    if (typeof locator === 'number' && typeof offsetX === 'number') {
      offsetY = offsetX;
      offsetX = locator;
      locator = null;
    }

    if (locator) {
      return this._locate(withStrictLocator(locator), true).then(function (res) {
        if (!res.value || res.value.length === 0) {
          return truth(`elements of ${locator}`, 'to be seen').assert(false);
        }
        let elem = res.value[0];
        if (client.isMobile) return this.touchScroll(elem.ELEMENT, offsetX, offsetY);
        return client.elementIdLocation(elem.ELEMENT).then(function (location) {
          if (!location.value || location.value.length === 0) {
            throw new Error(
            `Failed to receive (${locator}) location`);
          }
          return client.execute(function scroll(x, y) {
            return window.scrollTo(x, y);
          }, location.value.x + offsetX, location.value.y + offsetY);
        });
      });
    } else {
      if (client.isMobile) return client.touchScroll(locator, offsetX, offsetY);
      return client.execute(function scroll(x, y) {
        return window.scrollTo(x, y);
      }, offsetX, offsetY);
    }
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
 
        _highlightElement,
        _displayBoxGrid,
        _createOutputDirIfNecessary,
        _setTestTitle,
        _storeForReport,
        _getReportData,
        
        _waitForVisible,
        _scrollTo
    })

module.exports = {
    addExtensions
}