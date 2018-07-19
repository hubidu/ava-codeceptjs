const fs = require('fs')

const config = require('bifrost-io/src/config')
const zipDirectory = require('bifrost-io/src/utils/zip-directory')
const {isDashboardHostConfigured, sendReport} = require('bifrost-io/src/dashboard-api')

const rmFileSync = filename => fs.unlinkSync(filename)

module.exports = async (t) => {
  if (!isDashboardHostConfigured()) return Promise.resolve()

  const actor = t.context.I
  if (!actor) throw new Error('Expected an actor in test context')

  const {outputDir, runDir} = actor._test
  if (!outputDir) throw new Error('Expected actor to have an output directory set')

  const reportDir = [config.ownerkey, config.project, actor._test.prefix, runDir].join('/')

  const zipFile = await zipDirectory(outputDir, reportDir);
  try {
      await sendReport(zipFile)
  } finally {
      rmFileSync(zipFile)
  }
}
