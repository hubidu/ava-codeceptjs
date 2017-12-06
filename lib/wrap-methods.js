const debug = require('debug')('ava-codeceptjs')
const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const Appium = require('codeceptjs/lib/helper/Appium')
const { AssertionError } = require('ava/lib/assert')

const { saveScreenshot, saveSource } = require('./screenshot-utils')
const { parseStack } = require('./error-stack')
const { createAvaAssertion } = require('./ava-assertion')

const isWebdriverIO = instance => instance instanceof WebDriverIO
const isAppium = instance => instance instanceof Appium

const methodsOfObject = function (obj, className) {
  var methods = [];

  const standard = [
    'constructor',
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable'
  ];
  // Exclude additional methods  from being wrapped
  const excludes = [
    'grabBrowserLogs',
    'saveScreen',
    'saveScreenshot',
    'defineTimeout',
    'debug',
    'debugSection'
  ]

  while (obj.constructor.name !== className) {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (typeof obj[prop] !== 'function') return;
      if (standard.indexOf(prop) >= 0) return;
      if (excludes.indexOf(prop) >= 0) return;
      if (prop.indexOf('_') === 0) return;
      methods.push(prop);
    });
    obj = obj.__proto__;

    if (!obj || !obj.constructor) break;
  }
  return methods;
};

const isAssertionFn = fn => fn.name.indexOf('see') === 0 || fn.name.indexOf('click') === 0

const isSelector = (I, txt) => {
  if (txt && typeof txt === 'string') {
    if (isAppium(I)) return true // even text can be used as selector on android

    return (txt.indexOf('#') >= 0 || txt.indexOf('.') >= 0 || txt.indexOf('>') >= 0 || txt.indexOf('=') >= 0 || txt.indexOf('//') === 0 || txt.indexOf('android') === 0)
  }
  return false
}

const grabSelectorFromArgs = (fnName, args) => {
    switch (args.length) {
        case 1: return fnName === 'see' ? undefined : args[0] // first arg is the selector usually
        case 2:
            if(fnName.indexOf('fill') === 0) {
                return args[0]
            } else if (fnName === 'seeNumberOfElements' || fnName === 'seeNumberOfVisibleElements' || fnName === 'seeInField') {
                return args[0]
            } else if (fnName === 'selectOption') {
                return args[0]
            } else {
                return args[1]
            }
        case 3: return args[2]
    }
}

const isAutoScreenshotFunction = (I, fnName) => {
  const isApp = () => isAppium(I)

  const res = isApp() ? ['say', 'see'].indexOf(fnName) > -1
  : ['switchTo', 'click', 'see', 'seeTextEquals', 'say', 'seeElement', 'seeInField', 'seeInTitle', 'seeNumberOfVisibleElements', 'dontSee', 'dontSeeElement', 'dontSeeInField'].indexOf(fnName) > -1

  return res
}

const isAutowaitFunction = (I, fnName) => {
  if (isAppium(I)) {
    return ['click', 'see', 'seeElement', 'seeNumberOfVisibleElements', 'switchTo'].indexOf(fnName) > -1
  } else {
    return ['click', 'see', 'seeElement', 'seeNumberOfVisibleElements', 'grabHTMLFrom', 'grabTextFrom', 'fillField', 'switchTo', 'selectOption'].indexOf(fnName) > -1
  }
}

const actorFromActorOrPageObj = (actorOrPageObj) => actorOrPageObj.actor ? actorOrPageObj.actor : actorOrPageObj

const takeScreenshot = async (I, fn, args, isError = false) => {
    try {
        if (!isAppium(I)) { // highlight elements only in browser tests
          const selectorFromArgs = grabSelectorFromArgs(fn.name, args)
          if (isAssertionFn(fn) && isSelector(I, selectorFromArgs)) {
              try {
                  await I._highlightElement(selectorFromArgs, `I.${fn.name}(${args.join(',') || ''})`, isError)
                  if (isError) await I._scrollTo(selectorFromArgs)
              } catch (err) {
                console.log(`INFO Got an error highlighting element ${selectorFromArgs}`, err)
              }
          }
        }

        if (isError || !isAppium(I)) {
          await saveSource(I, Date.now() / 1000, fn.name, args, isError ? 'error' : '', '')
        }

        return await saveScreenshot(I, Date.now() / 1000, fn.name, args, isError ? 'error' : '', '')
    } catch (err) {
        console.log('ERROR Failed to save screenshot', err)
    }

}

const getPageUrlAndTitle = async I => {
    if (isAppium(I)) {
      const currentActivity = await I.browser.currentActivity()
      return { url: currentActivity.value, title: 'Android Activity' } // TODO Fix this for iOS
    }

    let pageUrl
    try { pageUrl = await I.browser.getUrl() } catch (err) {}
    let pageTitle
    try { pageTitle = await I.browser.getTitle() } catch (err) {}

    return { url: pageUrl, title: pageTitle }
}

const parseMethodStack = err => {
    // Take wrapFn of stack to get real position of error
    const newError = new Error()
    newError.stack = err.stack.split('\n').slice(2).join('\n')
    const parsedStack = parseStack(newError)

    return parsedStack
}

const getCodeStack = stackOfMethod => {
    const getSourceLocation = stacktraceArray => {
        const err = new Error()
        err.stack = stacktraceArray.join('\n')
        const stack = parseStack(err)
        return { file: stack.fileName, line: stack.lineNumber }
    }
    const codeStack = []

    stackWithoutCurrentMethod = stackOfMethod.stack.split('\n').slice(2)

    codeStack.push(getSourceLocation(stackWithoutCurrentMethod))

    const i = stackWithoutCurrentMethod.findIndex(l => l.match(/\.wrapped /))
    if (i > -1) {
        stackFromNextWrappedMethod = stackWithoutCurrentMethod.slice(i + 1)

        codeStack.push(getSourceLocation(stackFromNextWrappedMethod))
    }

    return codeStack
}

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
                    // await I.browser.waitForVisible(selectorFromArgs, 10000)
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
              debug('SCREENSHOT', screenshot)

              const page = await getPageUrlAndTitle(I)
              const codeStack = getCodeStack(stackOfMethod)

              I._storeForReport({ shotAt: Date.now(), success: true, codeStack, screenshot, page })
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

            I._storeForReport({ shotAt: Date.now(), failed: true, message: errorMessage, orgStack: err.stack, codeStack, screenshot, page })

            /**
             * Construct error
             */
            const newError = new Error(`at I.${fn.name}(${args}) I got instead "${errorMessage}")`)
            newError.stack = stackOfMethod.stack.split('\n').slice(2).join('\n') // TODO remove wrapped methods from stack
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
