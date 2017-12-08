const path = require('path')
const mkdirp = require('mkdirp')
const {makeFileName} = require('../utils')

const GALLERY_DIR = './__out/gallery'

try {
  mkdirp.sync(GALLERY_DIR)
} catch (err) {}


module.exports = {
  /**
   * Make a screenshot of the current page and add
   * to a screenshot gallery (i. e. put it into some path on disk)
   */
  addToGallery: function (label) {
    if (!label) throw new Error('Label cannot be empty')
    const browser = this.browser
    const deviceName = process.env.TEST_DEVICE || 'desktop'
    const fileName = makeFileName(label) + `.${deviceName}.png`
    const baseDir = path.join(GALLERY_DIR, makeFileName(label))

    mkdirp(baseDir)

    browser.saveScreenshot(path.join(baseDir, fileName))
  }
}
