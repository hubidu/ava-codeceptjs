const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

const makeFileName = (str) => {
    return str.replace(/[:\\\/\*\?><]/g, '')
}

 const screenshotDir = (t) =>`./_out/${makeFileName(t.title.replace('beforeEach for ', ''))}`

module.exports = {  
    createScreenshotDir(t) {
        // Set this for saving screenshots
        const outputDir = screenshotDir(t)

        try {
            rimraf.sync(`${outputDir}`, { maxBusyTries: 10 })
            mkdirp.sync(outputDir)
        } catch (err) {
            console.log(`Error creating output dir ${outputDir}`, err)
        }
        return outputDir
    },

    async saveScreenshot(actor, lineNumber, stepName, stepArgs = [], suffix = '', subdir = undefined) {
        if (!actor.outputDir) throw new Error('Expected output directory on actor')

        let outputDir = actor.outputDir
        if (subdir) {
            outputDir = path.join(outputDir, subdir)
            mkdirp(outputDir)
        }
        const baseFileName = makeFileName(`${lineNumber} - I.${stepName}(${stepArgs.join(',') || ''})${suffix}`)

        await actor.saveScreen(path.join(outputDir, baseFileName) + '.png', true)
        
        // const html = await actor.getSource()
        // fs.writeFileSync(path.join(outputDir, baseFileName + '.html'), html)

        return baseFileName + '.png'
    }
}