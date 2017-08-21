const fs = require('fs')
const path = require('path')

const codeExcerpt = require('./code-excerpt')

const saveReport = (t, report) => {
    const actor = t.context.I
    if (!actor) throw new Error('Expected actor')

    let outputDir = actor._test.outputDir
    if (!outputDir) throw new Error('Expected actor to have an output directory set')

    const baseFileName = 'report.json'
    fs.writeFileSync(path.join(outputDir, baseFileName), JSON.stringify(report, null, 2))
}

const safeExtractSource = sourceLocation => {
    let sourceCode
    try {
        sourceCode = codeExcerpt(sourceLocation)
    } catch (err) {
        console.log(`ERROR extracting code from ${testStackframe.fileName}`, err)
    }
    return sourceCode
}

const createReport = (t) => {
    const report = t.context._report
    let prefix = t.context.I._test.prefix
    let error
    
    let screenshotsWithSourceLocation = []

    if (report.screenshots) {
        screenshotsWithSourceLocation = report.screenshots.map(s => {
            s.codeStack = s.codeStack.map(sourceLocation => ({
                location: sourceLocation,
                source: safeExtractSource(sourceLocation)
            }))
            return s
        })
    }

    return Object.assign({}, report, {       
        fullTitle: `${prefix} -- ${t.title}`,
        prefix,
        title: t.title,
        result: t._test.assertCount > 0 ? 'error' : 'success',
        duration: (Date.now() - report.startedAt) / 1000,
        screenshots: screenshotsWithSourceLocation
    })
}

module.exports = {
    saveReport,
    createReport
}