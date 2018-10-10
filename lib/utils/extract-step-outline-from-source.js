const babel = require('@babel/core')

const extractStepOutline = require('bifrost-io/src/utils/extract-step-outline')
const findTestSourceInSource = require('bifrost-io/src/utils/find-test-source-in-source')

const extractOutline = source => extractStepOutline(source, /step\s*\((.*)\)/)

function extractStepOutlineFromSource(completeSource, testSource) {
  if (!testSource) {
    console.log('WARNING Expected to get a the test source')
    return
  }

  const babelResult = babel.transformSync(completeSource, {
    retainLines: true,
    presets: ["@ava/stage-4"]
  })
  completeSource = babelResult.code

  const testSourceLines = testSource.split('\n')
  const correctedTestSource = testSourceLines.slice(1, testSourceLines.length - 1).join('\n')

  if (!correctedTestSource) {
    console.log('WARNING Expected to get a corrected test source from ', testSource)
    return
  }

  const startingLineInSource = findTestSourceInSource(completeSource, correctedTestSource)
  if (startingLineInSource === -1) {
    console.log('ERROR Did not find test source in full source')
    console.log('Source of test file:')
    console.log(completeSource)
    console.log()
    console.log('Source of test function:')
    console.log(correctedTestSource)

    return
  }

  return extractOutline(correctedTestSource).map(s => Object.assign(s, {
    line: startingLineInSource + s.line
  }))
}

module.exports = {
  extractStepOutlineFromSource
}
