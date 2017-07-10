const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

const makeFileName = (str) => {
    return str.replace(/[:\\\/\*\?><]/g, '')
}

module.exports = {
    createScreenshotDir(title) {
        // Set this for saving screenshots
        global.output_dir = `./output/${makeFileName(title.replace('beforeEach for ', ''))}`
        rimraf.sync(global.output_dir)
        mkdirp(global.output_dir)
    },

    async saveScreenshot(actor, lineNumber, stepName, stepArgs = [], suffix = '', subdir = undefined) {
        let outputDir = global.output_dir
        if (subdir) {
            outputDir = path.join(outputDir, subdir)
            mkdirp(output_dir)
        }
        const baseFileName = makeFileName(`${lineNumber} - I.${stepName}(${stepArgs.join(',') || ''})${suffix}`)

        await actor.saveScreen(path.join(outputDir, baseFileName) + '.png', true)
        
        const html = await actor.getSource()
        fs.writeFileSync(path.join(outputDir, baseFileName + '.html'), html)

        return baseFileName + '.png'
    }
}