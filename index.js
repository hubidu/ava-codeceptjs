const debug = require('debug')('ava-codeceptjs')
const { AssertionError } = require('ava/lib/assert')

const { wrap } = require('./lib/wrap-methods')

const createWebDriver = require('./lib/create-web-driver')
const createAppiumDriver = require('./lib/create-appium')

const { createReport, saveReport } = require('./lib/reporter')
const { on, within, step } = require('./lib/context-methods')
const { extractOutline } = require('./lib/extract-outline')

const execTestInBrowser = (opts, fn) => {
    if (typeof opts === 'function') {
        fn = opts
        opts = { teardown: true }
    } else {
        opts = Object.assign({ teardown: true }, opts)
    }

    const driverCreateFn = opts.driverCreateFn || createWebDriver

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
                const steps = extractOutline(fn.toString())

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

            if (t._test.assertCount > 0) {
                // TODO Fail the test
                // TODO Better: wrap ava' t.is, t.deepEqual etc and throw on first fail
            }


            t.context._report.testResults.push(true)
        } catch (err) {
            t.context._report.testResults.push(false)

            if (err instanceof AssertionError) {
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
                      await saveReport(t, await createReport(t))
                    } catch (err) {
                      console.log('ERROR Failed to save report', err)
                      throw new Error(`Failed to save report - ${err.message}`)
                    } finally {
                      // Teardown browser instance
                      await t.context.I._after()
                      await t.context.I._afterSuite()

                      t.context.I = undefined

                      // Try wait to prevent chromedriver freeze
                      await new Promise((resolve, reject) => setTimeout(resolve, 2000))
                    }
                }
            }
        }

    }
}

const inBrowser = (opts, fn) => {
  opts.driverCreateFn = createWebDriver
  return execTestInBrowser(opts, fn)
}
const inApp = (opts, fn) => {
  opts.driverCreateFn = createAppiumDriver
  return execTestInBrowser(opts, fn)
}
const prepareBrowser = fn => execTestInBrowser({ teardown: false }, fn)
const teardownBrowser = fn => execTestInBrowser({ teardown: true }, fn)

const { testFromStacktrace } = require('./lib/utils')

module.exports = {
    prepareBrowser,
    teardownBrowser,
    inApp,
    inBrowser
}
