const fs = require('fs')
const path = require('path')

const saveReport = (t, report) => {
  const actor = t.context.I
  if (!actor) throw new Error('Expected an actor in test context')

  let outputDir = actor._test.outputDir
  if (!outputDir) throw new Error('Expected actor to have an output directory set')

  const ReportFileName = 'report.json'
  fs.writeFileSync(path.join(outputDir, ReportFileName), JSON.stringify(report, null, 2))
}

module.exports = saveReport
