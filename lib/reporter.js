const fs = require('fs')
const path = require('path')

const codeExcerpt = require('./code-excerpt')

const saveReport = (t, report) => {
    const actor = t.context.I
    if (!actor) throw new Error('Expected actor')

    let outputDir = actor._test.outputDir
    if (!outputDir) throw new Error('Expected output dir on actor')

    const baseFileName = 'report.json'
    fs.writeFileSync(path.join(outputDir, baseFileName), JSON.stringify(report, null, 2))
}

const createReport = (t, err, testStackframe, errorScreenshotFile) => {
    let prefix = t.context.I._test.prefix
    let error
    
    if (err) {
        let sourceCode
        try {
            sourceCode = codeExcerpt({ file: testStackframe.fileName, line: testStackframe.lineNumber })
        } catch (err) {
            console.log(err)
        }

        error = {
            pageUrl: t.context.pageUrl,
            pageTitle: t.context.pageTitle,
            screenshot: errorScreenshotFile,
            sourceLocation: { file: testStackframe.fileName, line: testStackframe.lineNumber },
            sourceCode,
            message: err.message,
            stack: err.stack,
            orgStack: err.orgStack,
            failedStep: err._failedStep
        }
    }

    return {       
        fullTitle: `${prefix} -- ${t.title}`,
        prefix,
        title: t.title,
        result: err ? 'error' : 'success',
        startedAt: t.context.startedAt,
        duration: (Date.now() - t.context.startedAt) / 1000,
        error
    }
}

module.exports = {
    saveReport,
    createReport
}