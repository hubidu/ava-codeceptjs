// const { test } = require('ava')
// const wdioScreenshot = require('wdio-screenshot')
const { AssertionError } = require('ava/lib/assert')

const { wrap } = require('./lib/wrap-methods')
const driverCreate = require('./lib/driver')
const { createScreenshotDir, saveScreenshot } = require('./lib/screenshot-utils')
const { createReport, saveReport } = require('./lib/reporter')
const { on, within } = require('./lib/context-methods')
const { parseStack } = require('./lib/error-stack')

const isHook = testFn => testFn.type === 'hook'

// function createCatchErrors(testFn) {
//     const catchingErrorsFn = async function (t, ...args) { // Leave it anonymous otherwise ava will use the function name
//         try {
//             // Ad these methods to each execution context
//             t.on = on.bind(t)
//             t.within = within.bind(t)

//             const I = t.context.I

//             // Attach report data model to the context
//             if (!isHook(testFn)) {
//                 t.context._report = {
//                     startedAt: Date.now()
//                 }
//             }

//             // console.log(`'${t.title}' Running ...`)
//             const ret = await testFn(t, ...args)
//             // console.log(`'${t.title}' Finished with result = `, ret)

//             if (!isHook(testFn)) {
//                 t.context._report = Object.assign({}, t.context._report, {
//                     screenshots: I._getReportData()
//                 })
//                 await saveReport(t, createReport(t))
//             } 
//         } catch (err) {      
//             const I = t.context.I
//             const values = []
            
//             // Correct the stack trace
//             // TODO: There might be ava assertions
//             // TODO: There might be webdriverio errors which stack can not be parsed

//             // TODO Use different strategy: Find error location in the test then find actual source of the error 
//             const orgStack = err.stack
//             err.stack = err.stack.split('\n').slice(2).join('\n')
//             const testStackframe = parseStack(err)

//             t._test.addFailedAssertion(createAvaAssertion(err, testStackframe, values))

//             // Attach failed step info
//             if (!err._failedStep) {
//                 err._failedStep = {
//                     name: `line ${testStackframe.lineNumber}`,
//                     args: []
//                 }
//             }
//             if (err._failedStep) {
//                 // Get collected report data and attach to context
//                 t.context._report = Object.assign({}, t.context._report, {
//                     screenshots: I._getReportData()
//                 })
//                 await saveReport(t, createReport(t, err, testStackframe))
//             }

//         }
//     }

//     if (testFn.title) catchingErrorsFn.title = testFn.title
//     return catchingErrorsFn
// } 

const execTestInBrowser = (opts, fn) => {
    if (typeof opts === 'function') {
        fn = opts
        opts = { teardown: true }
    }
    return async t => {
        t._test.failWithoutAssertions = false // Don't fail without assertion since we are using
                                        // codeceptjs see... methods (usually)

        if (!t.context.I) {
            const I = wrap(driverCreate())

            await I._beforeSuite()
            await I._before()

            // Ad these methods to each execution context
            t.on = on.bind(t)
            t.within = within.bind(t)

            t.context.I = I
            I._setTestTitle(t.title)
        }

        const { I } = t.context
        try {

            // Attach report data model to the context
            if (!t.context._report) {
                t.context._report = {
                    startedAt: Date.now() // TODO use test start date
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
                throw err
            }
        } finally {
            if (t.context.I) {
                if (opts.teardown) {
                    // Teardown browser instance
                    await t.context.I._after()
                    await t.context.I._afterSuite()

                    // Save report file
                    t.context._report = Object.assign({}, t.context._report, {
                        screenshots: I._getReportData()
                    })
                    await saveReport(t, createReport(t))
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
