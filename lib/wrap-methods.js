const debug = require('debug')('ava-codeceptjs')

// Various assertion errors
const { AssertionError: AVAAssertionError } = require('ava/lib/assert')
const CodeceptjsAssertionError = require('codeceptjs/lib/assert/error')
const { AssertionError } = require('assert');

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

const toString = v => {
  if (v === undefined || v === null) return v
  if (typeof v === 'object') return JSON.stringify(v)
  return v.toString()
}
const toStringArgs = args => args ? args.map(toString) : undefined

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

            // Call the original function
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
                args: toStringArgs(args),
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
            if (err instanceof AVAAssertionError) {
              // TODO Basically I should also take a screenshot in this case
              throw err // Pass ava assertions up
            }
            if (err instanceof CodeceptjsAssertionError) {
              // Seems that codeceptjs errors do not have a stack trace property???
              // Therefore we need to FIX the stack
              err.stack = [err.inspect(), ...stackOfMethod.stack.split('\n').slice(1)].join('\n')
            } else if (err instanceof AssertionError) {
              // Keep the original error stack
            } else {
              // In the default case fix the error stack by using the stack of the method
              err.stack = stackOfMethod.stack
            }

            const message = err.message || err.cliMessage()

            /**
             * Save error screenshot
             */
            const screenshot = await takeScreenshot(I, fn, args, true)
            const page = await getPageUrlAndTitle(I)
            const codeStack = getCodeStack(err)
            const cmd = {
              name: fn.name,
              args: toStringArgs(args),
            }

            I._storeForReport({
              shotAt: Date.now(),
              failed: true,
              message,
              orgStack: err.stack,
              actual: toString(err.actual),
              expected: toString(err.expected),
              operator: err.operator,
              cmd,
              codeStack,
              screenshot,
              page
            })

            /**
             * Construct error
             */
            const newError = new Error(message)
            newError.stack = correctStackLines(err.stack.split('\n')).join('\n')
            newError.orgStack = err.stack
            newError.actual = toString(err.actual)
            newError.expected = toString(err.expected)
            newError.operator = err.operator

            // TODO Should be obsolete since we always attach the command with args now
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
