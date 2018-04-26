const fs = require('fs')
const path = require('path')

const codeExcerpt = require('./code-excerpt')

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

const saveReport = (t, report) => {
    const actor = t.context.I
    if (!actor) throw new Error('Expected actor')

    let outputDir = actor._test.outputDir
    if (!outputDir) throw new Error('Expected actor to have an output directory set')

    const baseFileName = 'report.json'
    fs.writeFileSync(path.join(outputDir, baseFileName), JSON.stringify(report, null, 2))
}

const grabBrowserLogsSafe = async actor => {
    const byTimestampDesc  = (a, b) => b.timestamp - a.timestamp

    if (!actor) return undefined
    if (!actor.browser) return undefined

    try {
        let logs1, logs2
        try { logs1 = await actor.browser.log('performance') } catch (_) {}
        try { logs2 = await actor.browser.log('browser') } catch (_) {}

        let allLogs = []
        if (logs1) {
          allLogs = allLogs.concat(logs1.value)
        }
        if (logs2) {
          allLogs = allLogs.concat(logs2.value)
        }

        allLogs = allLogs
          .filter(l => l.level === 'SEVERE')
          .sort(byTimestampDesc)
        if (allLogs.length > 0) {
          console.log('WARNING Test produced SEVERE messages in browser', allLogs)
        }

        return allLogs
    } catch (err) {
        console.log('WARNING Failed to grab browser logs', err)
        return undefined
    }
}

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
        project: process.env.TEST_PROJECT || undefined,
        runId: RUN_ID,
        ownerKey: process.env.OWNER_KEY,
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
    saveReport,
    createReport
}
