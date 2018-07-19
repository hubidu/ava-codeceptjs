const fs = require('fs')
const path = require('path')

const ReportFileName = 'report.json'
const TestSourceFileName = 'source.txt'
const BrowserLogs = 'browserlogs.json'

const saveReport = (t, report, testSource) => {
  const actor = t.context.I
  if (!actor) throw new Error('Expected an actor in test context')

  let outputDir = actor._test.outputDir
  if (!outputDir) throw new Error('Expected actor to have an output directory set')

  const logs = report.logs
  report.logs = []

  fs.writeFileSync(path.join(outputDir, BrowserLogs), JSON.stringify(logs, null, 2))

  fs.writeFileSync(path.join(outputDir, ReportFileName), JSON.stringify(report, null, 2))

  if (testSource) {
    fs.writeFileSync(path.join(outputDir, TestSourceFileName), testSource)
  }
}

module.exports = saveReport
