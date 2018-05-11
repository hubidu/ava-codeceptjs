const fs = require('fs')
const path = require('path')

const config = require('bifrost-io/config')

const uploadReport = require('./upload-report')
const saveReport = require('./save-report')
const codeExcerpt = require('./code-excerpt')
const grabBrowserLogsSafe = require('./grab-browser-logs')

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

const RUN_ID = guid()

/**
 * Create the report metadata object
 */
const createReport = async t => {
    const safeExtractSource = sourceLocation => {
        let sourceCode
        try {
            sourceCode = codeExcerpt(sourceLocation)
        } catch (err) {
            console.log(`WARNING extracting code from source location`, err, sourceLocation)
        }
        return sourceCode
    }

    const report = t.context._report
    const prefix = t.context.I._test.prefix
    const testTitle = t.context.I._test.title
    const deviceSettings = t.context.I._deviceSettings[t.context.I._deviceSettings.deviceName]

    let testResult = 'error'
    if (!report.testResults) {
        testResult = 'todo'
    } else {
        testResult = report.testResults.reduce((agg, result) => agg && result, true) === false ? 'error' : 'success'
    }

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
    const logs = await grabBrowserLogsSafe(t.context.I)

    return Object.assign({}, report, {
        // TODO Add retry count
        ownerkey: config.ownerkey,
        project: config.project,
        runid: RUN_ID,
        fullTitle: `${prefix} -- ${testTitle}`,
        prefix,
        title: testTitle,
        result: testResult,
        duration: (Date.now() - report.startedAt) / 1000,
        screenshots: screenshotsWithSourceLocation,
        logs,
        deviceSettings
    })
}

module.exports = {
    uploadReport,
    saveReport,
    createReport
}
