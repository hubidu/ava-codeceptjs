const { test } = require('ava')
const wdioScreenshot = require('wdio-screenshot')

const { wrap } = require('./wrap-methods')
const driverCreate = require('./driver')
const { addExtensions } = require('./add-extensions')
const { createScreenshotDir, saveScreenshot } = require('./screenshot-utils')


const on = async (pageObj, handlerFn) => {
    await handlerFn(wrap(pageObj))
}

test.beforeEach(async t => {
    try {
        const I = addExtensions(driverCreate())

        createScreenshotDir(t.title)

        await I._beforeSuite()
        await I._before()

        // Add plugins
        wdioScreenshot.init(I.browser, {})

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

const { AssertionError } = require('ava/lib/assert')
const ErrorStackParser = require('error-stack-parser')

const parseErrorStack = (err) => {
    try {
        return ErrorStackParser.parse(err)[0]
    } catch (e) {
        console.log('Failed to parse error stack', e, err)
        return ''
    }
}

function createCatchErrors(testFn) {
    return async function catchErrors (t) {
        try {
            // console.log(`${t.title} Running ...`)
            const ret = await testFn(t)
            // console.log(`${t.title} Finished with result = `, ret)
        } catch (err) {      
            const values = []
 
            // Correct the stack trace
            // TODO: There might be ava assertions
            // TODO: There might be webdriverio errors which stack can not be parsed
            const orgStack = err.stack
            err.stack = err.stack.split('\n').slice(2).join('\n')
            const testStackframe = parseErrorStack(err)

            t._test.addFailedAssertion(new AssertionError({
                assertion: true,
                type: 'exception',
                message: err.message,
                // source: source(__filename, 59),
                fixedSource: { file: testStackframe.fileName, line: testStackframe.lineNumber },
                // statements: ['I.amOnPage()', 'Foo()', 'Bar'],
                stack: err.orgStack,
                values
            }));

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

const myTest = (name, handlerFn) => test(name, createCatchErrors(handlerFn))
myTest.only = (name, handlerFn) => test.only(name, createCatchErrors(handlerFn))


module.exports = {
    test: myTest,
    scenario: myTest
}
