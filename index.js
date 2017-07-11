const { test } = require('ava')
const wdioScreenshot = require('wdio-screenshot')
const { AssertionError } = require('ava/lib/assert')
const ErrorStackParser = require('error-stack-parser')

const { wrap } = require('./wrap-methods')
const driverCreate = require('./driver')
const { createScreenshotDir, saveScreenshot } = require('./screenshot-utils')

const on = async (pageObj, handlerFn) => {
    await handlerFn(wrap(pageObj))
}

test.beforeEach(async t => {
    try {
        const I = wrap(driverCreate())

        await I._beforeSuite()
        await I._before()

        // Add plugins
        wdioScreenshot.init(I.browser, {})

        // Attach additional objects to test context
        t.context.I = I
        t.context.on = on
    } catch (err) {
        if (err.message.indexOf('ECONNREFUSED') >= 0) throw new Error('Could not connect to selenium server! Did you start it?')
        throw new Error(err)
    }
})
test.afterEach.always(async t => {
    const I = t.context.I
    if (!I) return

    await I._after()
    await I._afterSuite()
})

const parseErrorStack = (err) => {
    try {
        return ErrorStackParser.parse(err)[0]
    } catch (e) {
        console.log('Failed to parse error stack', e, err)
        return ''
    }
}

function createCatchErrors(testFn) {
    return async function (t) { // Leave it anonymous otherwise ava will use the function name
        try {
            // Wrap actor methods
            // t.context.I = wrap(t.context._I)
            // Each test needs its own dedicated output directory
            t.context.outputDir = t.context.I.outputDir = createScreenshotDir(t)

            // console.log(`${t.title} Running ...`)
            const ret = await testFn(t)
            // console.log(`${t.title} Finished with result = `, ret)
        } catch (err) {      
            const values = []
            
            // console.log('createCatchErrors', err)

            // Correct the stack trace
            // TODO: There might be ava assertions
            // TODO: There might be webdriverio errors which stack can not be parsed
            const orgStack = err.stack
            err.stack = err.stack.split('\n').slice(2).join('\n')
            const testStackframe = parseErrorStack(err)

            const avaAssertion = new AssertionError({
                name: 'AssertionError',
                assertion: 'is',
                improperUsage: false,
                // type: 'exception',
                message: err.message,
                actual: err.actual,
                expected: err.expected,
                // source: source(__filename, 59),
                fixedSource: { file: testStackframe.fileName, line: testStackframe.lineNumber },
                // statements: ['I.amOnPage()', 'Foo()', 'Bar'],
                stack: err.stack,
                values
            })
            t._test.addFailedAssertion(avaAssertion)

            // Save error screenshot
            if (!err._failedStep) {
                err._failedStep = {
                    name: `line ${testStackframe.lineNumber}`,
                    args: []
                }
            }
            if (err._failedStep) {
                const screenshotFileName = 
                    await saveScreenshot(t.context.I, testStackframe.lineNumber, err._failedStep.name, err._failedStep.args, '.error')

                values.push({ label: 'Error Screenshot:', formatted: screenshotFileName })
            }

        }
    }
} 

/**
 * Wrap all ava test methods
 */
const myTest = (name, handlerFn) => test(name, createCatchErrors(handlerFn))
myTest.only = (name, handlerFn) => test.only(name, createCatchErrors(handlerFn))
myTest.beforeEach = (handlerFn) => test.beforeEach(createCatchErrors(handlerFn))
myTest.afterEach = (handlerFn) => test.afterEach(createCatchErrors(handlerFn))
myTest.afterEach.always = (handlerFn) => test.afterEach.always(createCatchErrors(handlerFn))

module.exports = {
    test: myTest,
    scenario: myTest
}
