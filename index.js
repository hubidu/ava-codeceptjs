const { AssertionError } = require('ava/lib/assert')

const { wrap } = require('./lib/wrap-methods')
const driverCreate = require('./lib/driver')
const { createReport, saveReport } = require('./lib/reporter')
const { on, within, step } = require('./lib/context-methods')
const { extractOutline } = require('./lib/extract-outline')

const execTestInBrowser = (opts, fn) => {
    if (typeof opts === 'function') {
        fn = opts
        opts = { teardown: true }
    }

    // Return a test function which takes a test execution context
    return async t => {
        // Never teardown in before hook
        if (t._test.metadata.type.indexOf('before') === 0) opts.teardown = false

        t._test.failWithoutAssertions = false // Don't fail without assertion since we are using
                                        // codeceptjs see... methods (usually)
        if (t.context && !t.context.I) { // Note that after.always has no context
            const I = wrap(driverCreate())

            await I._beforeSuite()
            await I._before()

            t.context.I = I
            I._setTestTitle(t.title)
        }

        // Add these methods every time because they are not context
        t.on = on.bind(t)
        t.within = within.bind(t)
        t.step = step.bind(t)

        const { I } = t.context
        try {

            // Attach report data model to the context
            if (!t.context._report) {
                const steps = extractOutline(fn.toString())

                t.context._report = {
                    startedAt: t._test.startedAt,
                    outline: {
                        steps: steps.map(stepName => ({
                            name: stepName,
                            success: false
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


        } catch (err) {
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
                    // Save report file
                    t.context._report = Object.assign({}, t.context._report, {
                        screenshots: I._getReportData()
                    })
                    await saveReport(t, createReport(t))
                    
                    // Teardown browser instance
                    await t.context.I._after()
                    await t.context.I._afterSuite()

                    t.context.I = undefined
                }
            }
        }

    }
}

const inBrowser = (opts, fn) => execTestInBrowser(opts, fn)
const prepareBrowser = fn => execTestInBrowser({ teardown: false }, fn)
const teardownBrowser = fn => execTestInBrowser({ teardown: true }, fn)


module.exports = {
    prepareBrowser,
    teardownBrowser,
    inBrowser,
}
