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
    err.stack = err.stack.split('\n').find(l => /(at test)|(at scenario)/.test(l))
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
    this.reportData.push(data)
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