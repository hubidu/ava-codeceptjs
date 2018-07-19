const debug = require('debug')('ava-codeceptjs')
const { AssertionError: AVAAssertionError } = require('ava/lib/assert')

const { wrap } = require('./lib/wrap-methods')

const createWebDriver = require('./lib/create-web-driver')
const createAppiumDriver = require('./lib/create-appium')

const { createReport, saveReport, uploadReport } = require('./lib/reporter')
const { on, within, step } = require('./lib/context-methods')
const { extractOutline } = require('./lib/extract-outline')

const { fileToStringSync } = require('./lib/utils/file-to-string')

const execTestInBrowser = (opts, fn) => {
    if (typeof opts === 'function') {
        fn = opts
        opts = { teardown: true }
    } else {
        opts = Object.assign({ teardown: true }, opts)
    }

    const driverCreateFn = opts.driverCreateFn || createWebDriver
    const testSource = fn.toString()

    // Return a test function which takes a test execution context
    return async t => {
        // Should be callers choice. There are use cases where you need control
        // if (t._test.metadata.type.indexOf('before') === 0) opts.teardown = false

        t._test.failWithoutAssertions = false // Don't fail without assertion since we are using
                                        // codeceptjs see... methods (usually)
        if (t.context && !t.context.I) { // Note that after.always has no context
            const I = wrap(driverCreateFn(opts))

            await I._beforeSuite()
            await I._before()

            t.context.I = I
            I._setTestTitle(t.title)
        }

        /*
         * Add these methods every time because they are not context
         */
        t.on = on.bind(t)
        t.using = on.bind(t) // alias for rest client objects
        t.within = within.bind(t)
        t.step = step.bind(t)

        const { I } = t.context // NOTE there is no context in before either
        try {

            // Attach report data model to the context
            if (!t.context._report) {
                const steps = extractOutline(testSource)

                t.context._report = {
                    startedAt: t._test.startedAt,
                    type: 'test',
                    testResults: [],
                    outline: {
                        steps: steps.map(stepName => ({
                            name: stepName,
                            success: undefined
                        }))
                    }
                }
            }

            // Execute the test or hook function
            await fn(t, t.context.I)

            t.context._report.testResults.push(true)
        } catch (err) {
            t.context._report.testResults.push(false)

            if (err instanceof AVAAssertionError) {
                t._test.addFailedAssertion(err)
            } else {
                // TODO Could create an ava error for that too?
                t._test.addFailedAssertion(err)
                throw err
            }
        } finally {
            if (t.context.I) {
                if (opts.teardown) {
                    debug('Tearing down webdriver instance')
                    // Save report file
                    t.context._report = Object.assign({}, t.context._report, {
                        screenshots: I._getReportData()
                    })
                    try {
                      const report = await createReport(t)
                      if (report.logs.length > 0) t.log(`Test has ${report.logs.length} browser log entries`)

                      // TODO Store test source code

                      await saveReport(t, report, fileToStringSync(I._test.fileName))
                      uploadReport(t) // Don't wait
                    } catch (err) {
                      console.log('ERROR Failed to save report', err)
                      throw new Error(`Failed to save report - ${err.message}`)
                    } finally {
                      // Teardown browser instance
                      await t.context.I._after()
                      await t.context.I._afterSuite()

                      t.context.I = undefined

                      // Try wait to prevent chromedriver freeze
                      await new Promise((resolve, _) => setTimeout(resolve, 2000))
                    }
                }
            }
        }

    }
}

/**
 * Run test again if it failed with an assertion
 * in order to confirm the failure
 * @param {*} fn
 */
const confirmTestFailure = fn => {
  return async t => {
    await fn(t)

    if (t._test.assertError) {
      console.log(`WARNING Test '${t._test.title}' failed. Now trying to confirm the error...`)

      // Reset test state
      t._test.assertError = undefined
      t._test.startedAt = Date.now()
      t.context = {}

      await fn(t)
    }
  }
}

const inBrowser = (opts, fn) => {
  opts.driverCreateFn = createWebDriver

  if (process.env.TEST_RETRY) {
    return confirmTestFailure(execTestInBrowser(opts, fn))
  }

  return execTestInBrowser(opts, fn)
}
const inApp = (opts, fn) => {
  opts.driverCreateFn = createAppiumDriver
  // TODO Add retry
  return execTestInBrowser(opts, fn)
}
const { testFromStacktrace } = require('./lib/utils')

module.exports = {
    inApp,
    inBrowser
}
