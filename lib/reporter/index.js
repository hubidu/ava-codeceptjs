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

const createReport = (t) => {
    const safeExtractSource = sourceLocation => {
        let sourceCode
        try {
            sourceCode = codeExcerpt(sourceLocation)
        } catch (err) {
            console.log(`ERROR extracting code from ${testStackframe.fileName}`, err)
        }
        return sourceCode
    }

    const report = t.context._report
    const prefix = t.context.I._test.prefix
    const testTitle = t.context.I._test.title
    // const testResult = t._test.assertCount > 0 ? 'error' : 'success'
    const testResult = report.testResults.reduce((agg, result) => agg && result, true) === false ? 'error' : 'success'
    let error
    
    let screenshotsWithSourceLocation = []

    // Add source code excerpt to screenshots
    if (report.screenshots) {
        screenshotsWithSourceLocation = report.screenshots.map(s => {
            s.codeStack = s.codeStack.map(sourceLocation => ({
                location: sourceLocation,
                source: safeExtractSource(sourceLocation)
            }))
            return s
        })
    }

    // Mark failed step
    if (testResult === 'error') {
        let i = 0
        for (step of report.outline.steps) {
            if (step.success === undefined) {
                if (i > 0) {
                    report.outline.steps[i - 1].success = false
                }
                break;
            } else if (step.success === true && i === report.outline.steps.length - 1) {
                report.outline.steps[i].success = false
            }
            i++
        }
    }

    return Object.assign({}, report, {       
        fullTitle: `${prefix} -- ${testTitle}`,
        prefix,
        title: testTitle,
        result: testResult,
        duration: (Date.now() - report.startedAt) / 1000,
        screenshots: screenshotsWithSourceLocation
    })
}

module.exports = {
    saveReport,
    createReport
}