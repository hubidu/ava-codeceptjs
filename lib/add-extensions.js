const debug = require('debug')('ava-codeceptjs')
const path = require('path')
const { cleanTestTitle, testFromStacktrace } = require('./utils')

// TODO Move more extensions there
const { _setDeviceSettings, applyDeviceSettings } = require('./extensions/device-settings')
const { _highlightElement, _displayBoxGrid } = require('./extensions/highlight-element')

function saveScreen(fullPath) {
    if (!fullPath) throw new Error('Expected to get a full screenshot path')
    const browser = this.browser

    return browser.saveScreenshot(fullPath)
}

function saveScreenshot(fileName) {
    const browser = this.browser

    return browser.saveScreenshot(path.join(this._test.outputDir, fileName))
}

function _saveSource(filepath) {
  const browser = this.browser

  const fs = require('fs');

  debug('Saving source to', filepath)
  return browser.source().then(res => {
    fs.writeFileSync(filepath, res.value)
  })
}

/**
 * Override say to not do anything
 */
function say(txt) {
    return Promise.resolve(txt)
}

function _setTestTitle(title) {
    this._test = { title: cleanTestTitle(title) }
}

function _createOutputDirIfNecessary(testFileName = undefined) {
    const { createScreenshotDir } = require('./screenshot-utils.js')

    if (this._test && this._test.prefix) return

    if (!testFileName) {
        const sti = testFromStacktrace(new Error())
        testFileName = sti.fileName
    }

    if (!testFileName) return

    const testRelPath = path.join('.', testFileName
                            .replace(process.cwd() + path.sep, '')
                            .replace(/\.test\.js/g, '')
                            .replace(/\//g, ' -- ')
                            .replace(/\\/g, ' -- ')
                        )

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

const addExtensions = (actor) => {
  // Preserve unwrapped version of codecept's waitForVisible
  const _autoWait = actor.waitForVisible

  return Object.assign(actor, {
    // grabElementsFrom,
    // saveScreenshotFullscreen,
    // saveElementScreenshot,
    // getSource,
    saveScreen,
    saveScreenshot,
    _saveSource,
    say,

    _setDeviceSettings,
    applyDeviceSettings,

    _highlightElement,
    _displayBoxGrid,
    _createOutputDirIfNecessary,
    _setTestTitle,
    _storeForReport,
    _getReportData,

    _autoWait,
    _scrollTo
  })
}

module.exports = {
    addExtensions
}
