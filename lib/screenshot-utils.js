const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

const makeFileName = (str) => {
    return str.replace(/[\r\n'":,;\\\/\*\?><]/g, '')
}

 const screenshotDir = (prefix, title) =>`./__out/${prefix}/${Date.now()}-${makeFileName(title)}`

module.exports = {  
    createScreenshotDir(prefix, title) {
        // Set this for saving screenshots
        const outputDir = screenshotDir(prefix, title)

        // try {
        //     rimraf.sync(`${outputDir}/`, { maxBusyTries: 10, glob: '*.png' })
        // } catch (err) {
        //     console.log(`Error removing output dir ${outputDir}`, err)
        // }
        try {
            mkdirp.sync(outputDir)
        } catch (err) {
            console.log(`Error creating output dir ${outputDir}`, err)
        }
        return outputDir
    },

    async saveScreenshot(actor, lineNumber, stepName, stepArgs = [], suffix = '', subdir = undefined) {
        if (!actor._test) throw new Error('Expected test with output directory on actor')

        let outputDir = actor._test.outputDir
        if (subdir) {
            outputDir = path.join(outputDir, subdir)
            mkdirp(outputDir)
        }
        const baseFileName = makeFileName(`${suffix.toUpperCase()} ${lineNumber} - I.${stepName}(${stepArgs.join(',') || ''})`)

        await actor.saveScreen(path.join(outputDir, baseFileName) + '.png', true)
        
        // const html = await actor.getSource()
        // fs.writeFileSync(path.join(outputDir, baseFileName + '.html'), html)

        if (suffix) {
            const logs = await actor.grabBrowserLogs()
            if (logs.length > 0) fs.writeFileSync(path.join(outputDir, baseFileName + '.logs'), JSON.stringify(logs))
        }

        return baseFileName + '.png'
    }
}