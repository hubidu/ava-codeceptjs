const debug = require('debug')('ava-codeceptjs')
const { AssertionError } = require('ava/lib/assert')

const { parseStack } = require('./error-stack')
const { createAvaAssertion } = require('./ava-assertion')
const {
  methodsOfObject,
  isSelector,
  grabSelectorFromArgs,
  isAutoScreenshotFunction,
  isAutowaitFunction,
  actorFromActorOrPageObj,
  takeScreenshot,
  getPageUrlAndTitle,
  getCodeStack,
  correctStackLines,
} = require('./wrap-utils')


function wrapFn (actor, fn) {
    return async function wrapped(...args) {
        const fn2 = fn.bind(actor)

        const stackOfMethod = new Error()
        const I = actorFromActorOrPageObj(actor)

        try {
            I._createOutputDirIfNecessary() // Must be here because we need to extract the test file name from the stacktrace

            /**
             * Automatically wait for elements to become visible
             */
            const selectorFromArgs = grabSelectorFromArgs(fn.name, args)
            if (isAutowaitFunction(I, fn.name) && isSelector(I, selectorFromArgs)
            ) {
                try {
                    const waitForInSecs = I.options.waitForTimeout
                    debug(`Autowaiting on ${fn.name} for element ${selectorFromArgs} (${waitForInSecs})`, )

                    await I._autoWait(selectorFromArgs, waitForInSecs)
                } catch (err) {
                    // Just ignore that to avoid failing on StaleElementReferenceException
                    console.log(`WARNING Autowait for element ${selectorFromArgs} failed`, err)
                }
            }

            // Execute the step
            const indentation = actor === I ? '  ' : ''
            debug('CMD', indentation + fn.name, args)
            const ret = await fn2(...args)

            /**
             * Save screenshots after step execution
             */
            if (isAutoScreenshotFunction(I, fn.name)) {
              // NOTE taking screenshots takes about 4 seconds on Android
              const screenshot = await takeScreenshot(I, fn, args)
              const page = await getPageUrlAndTitle(I)
              const codeStack = getCodeStack(stackOfMethod)
              const cmd = {
                name: fn.name,
                args: args,
              }

              I._storeForReport({
                shotAt: Date.now(),
                success: true,
                cmd,
                codeStack,
                screenshot,
                page
              })
            }

            return ret
        } catch (err) {
            if (err instanceof AssertionError) throw err // Pass ava assertions up

            const errorMessage = err.message || err.cliMessage()

            /**
             * Save error screenshot
             */
            const screenshot = await takeScreenshot(I, fn, args, true)
            const page = await getPageUrlAndTitle(I)
            const codeStack = getCodeStack(stackOfMethod)
            const cmd = {
              name: fn.name,
              args,
            }

            I._storeForReport({
              shotAt: Date.now(),
              failed: true,
              message: errorMessage,
              orgStack: err.stack,
              actual: err.actual,
              expected: err.expected,
              cmd,
              codeStack,
              screenshot,
              page })

            /**
             * Construct error
             */
            const newError = new Error(`${errorMessage}`)
            newError.stack = correctStackLines(stackOfMethod.stack.split('\n')).join('\n')
            newError.orgStack = err.stack
            newError.actual = err.actual
            newError.expected = err.expected
            // Attach failed step data
            newError._failedStep = {
                name: fn.name,
                args
            }

            const testStackframe = parseStack(newError)
            throw createAvaAssertion(newError, testStackframe, [])
        }
    }
}

const wrap = (actor, Clazz) => {
  const noDuplicates = arr => arr.filter((item, index, self) => index === self.indexOf(item))

  const methods = noDuplicates(methodsOfObject(actor))

  methods.forEach(method => {
    actor[method] = wrapFn(actor, actor[method])
  })
  actor.$isWrapped = true
  return actor
}

module.exports = {
    wrap
}
