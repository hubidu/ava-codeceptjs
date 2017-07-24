const { test } = require('ava')
const wdioScreenshot = require('wdio-screenshot')
const { AssertionError } = require('ava/lib/assert')
const ErrorStackParser = require('error-stack-parser')

const { wrap } = require('./wrap-methods')
const driverCreate = require('./driver')
const { createScreenshotDir, saveScreenshot } = require('./screenshot-utils')

/**
 * Do something in context of page object
 */
async function on (pageObjClazz, handlerFn) {
    const actor = this.context.I
    // Create an instance of the page object class
    // and wrap its methods to intercept and map exceptions
    const wrappedPageObject = wrap(new pageObjClazz(actor))

    // Attach some context information
    if (!actor._test) throw new Error('Expected _test property on actor')
    // wrappedPageObject.outputDir = this.context.I._test.outputDir
    // Keep reference to actor for screenshotting
    wrappedPageObject.actor = actor

    await handlerFn(wrappedPageObject)
}

/**
 * Do something in context of an element on the page
 */
async function within (sel, handlerFn) {
    const actor = this.context.I

    await actor.waitForVisible(sel)

    await actor._withinBegin(sel)
    try {
        await handlerFn()
    } catch (err) {
        await actor._withinEnd()
        throw err    
    }
    await actor._withinEnd()
}

test.beforeEach(async t => {
    try {
        // console.log('Creating webdriver instance...')
        const I = wrap(driverCreate())

        await I._beforeSuite()
        await I._before()

        // TODO That depends on device being tested. Should be configurable
        // await I.resizeWindow('maximize')

        await I.defineTimeout({ implicit: 5000, 'page load': 40000, script: 20000 })
        // Add plugins
        // wdioScreenshot.init(I.browser, {})

        // Attach additional objects to test context
        t.context.I = I
    } catch (err) {
        if (err.message.indexOf('ECONNREFUSED') >= 0) throw new Error('Could not connect to selenium server! Did you start it?')
        throw new Error(err)
    }
})
test.beforeEach(async t => {
    const I = t.context.I
    
    // Setup test output directory
    I._setTestTitle(t.title)
})
test.afterEach.always(async t => {
    const I = t.context.I
    if (!I) return

    // console.log('Destroying webdriver instance...')
    await I.wait(2)
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
            // Ad these methods to each execution context
            t.on = on.bind(t)
            t.within = within.bind(t)

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

            if (err.actual && err.expected) {
                values.push({ label: 'actual', formatted: err.actual })
                values.push({ label: 'expected', formatted: err.expected })
            }

            const avaAssertion = new AssertionError({
                name: 'AssertionError',
                assertion: 'is',
                improperUsage: false,
                // type: 'exception',
                message: err.message,
                actual: err.actual,
                expected: err.expected,
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
myTest.skip = (name, handlerFn) => test.skip(name, createCatchErrors(handlerFn))
myTest.beforeEach = (handlerFn) => test.beforeEach(createCatchErrors(handlerFn))
myTest.afterEach = (handlerFn) => test.afterEach(createCatchErrors(handlerFn))
myTest.afterEach.always = (handlerFn) => test.afterEach.always(createCatchErrors(handlerFn))
myTest.failing = (name, handlerFn) => test.failing(name, createCatchErrors(handlerFn))

module.exports = {
    test: myTest,
    scenario: myTest
}
