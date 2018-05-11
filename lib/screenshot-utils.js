const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')

const {makeFileName} = require('./utils')

const TEST_BASEOUTPUTDIR = process.env.TEST_BASEOUTPUTDIR || '.'
const OUTPUTDIR = '__out'

module.exports = {
    createScreenshotDir(prefix, title) {
      const makeTestRundir = title => `${Date.now()}-${makeFileName(title)}`
      const makeScreenshotDir = (prefix, testRundir) => path.join(TEST_BASEOUTPUTDIR, OUTPUTDIR, prefix, testRundir)

      const testRundir = makeTestRundir(title)
      const outputDir = makeScreenshotDir(prefix, testRundir)

      try {
          mkdirp.sync(outputDir)
      } catch (err) {
          console.log(`Error creating output dir ${outputDir}`, err)
      }
      return {outputDir, prefix, testRundir}
    },

    async saveScreenshot(actor, lineNumber, stepName, stepArgs = [], suffix = '', subdir = undefined) {
        if (!actor._test) throw new Error('Expected test with output directory on actor')
        if (!actor.browser) return

        let outputDir = actor._test.outputDir
        if (subdir) {
            outputDir = path.join(outputDir, subdir)
            mkdirp(outputDir)
        }
        const baseFileName = makeFileName(`${lineNumber} - I.${stepName}(${stepArgs.join(',') || ''})`) + (suffix ? `.${suffix}` : '')
        const pngFileName = path.join(outputDir, baseFileName) + '.png'

        await actor.saveScreen(pngFileName, true)

        return baseFileName + '.png'
    },

    async saveSource(actor, lineNumber, stepName, stepArgs = [], suffix = '', subdir = undefined) {
      let outputDir = actor._test.outputDir
      if (subdir) {
          outputDir = path.join(outputDir, subdir)
          mkdirp(outputDir)
      }
      const baseFileName = makeFileName(`${lineNumber} - I.${stepName}(${stepArgs.join(',') || ''})`) + (suffix ? `.${suffix}` : '')
      const sourceFileName = path.join(outputDir, baseFileName) + (actor.isWeb ? '.html' : '.xml')

      if (process.env.TEST_AUTOSAVE_SOURCE) {
        await actor._saveSource(sourceFileName)
      }

      return sourceFileName
    }
}
