const debug = require('debug')('ava-codeceptjs')
const path = require('path')

const { cleanTestTitle, testFromStacktrace } = require('./utils')
const { createScreenshotDir } = require('./screenshot-utils.js')

// TODO Move more extensions there
const { _setDeviceSettings, applyDeviceSettings } = require('./extensions/device-settings')
const { _highlightElement } = require('./extensions/highlight-element')
const { addToGallery } = require('./extensions/add-to-gallery')
const clickVisible = require('./extensions/click-visible')

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

    if (!testRelPath) throw new Error('Expected to extract the test file name from stack trace')

    this._test.prefix = testRelPath
    const {outputDir, testRundir} = createScreenshotDir(this._test.prefix, this._test.title)
    this._test.runDir = testRundir
    this._test.outputDir = outputDir
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

const addExtensions = (actor) => {
  // Preserve unwrapped version of codecept's waitForVisible
  const _autoWait = actor.waitForVisible

  return Object.assign(actor, {
    addToGallery,
    saveScreen,
    saveScreenshot,
    clickVisible,
    _saveSource,
    say,

    _setDeviceSettings,
    applyDeviceSettings,

    _highlightElement,
    _createOutputDirIfNecessary,
    _setTestTitle,
    _storeForReport,
    _getReportData,

    _autoWait
  })
}

module.exports = {
    addExtensions
}
