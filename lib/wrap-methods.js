const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const { AssertionError } = require('ava/lib/assert')

const { saveScreenshot } = require('./screenshot-utils')
const { parseStack } = require('./error-stack')
const { createAvaAssertion } = require('./ava-assertion')

const isWebdriverIO = instance => instance instanceof WebDriverIO

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

const isSelector = txt => txt && typeof txt === 'string' && (txt.indexOf('#') >= 0 || txt.indexOf('.') >= 0 || txt.indexOf('>') >= 0)
const grabSelectorFromArgs = (fnName, args) => {
    switch (args.length) {
        case 1: return args[0]
        case 2: 
            if(fnName.indexOf('fill') === 0) {
                return args[0]
            } else if (fnName === 'seeNumberOfElements' || fnName === 'seeNumberOfVisibleElements' || fnName === 'seeInField') {
                return args[0]
            } else {
                return args[1]
            }
        case 3: return args[2]
    }
}

const isAutoScreenshotFunction = fnName => 
    [
        'see', 'say', 'seeElement', 'seeInField', 'seeInTitle', 'seeNumberOfVisibleElements', 'dontSee', 'dontSeeElement', 'dontSeeInField'
    ].indexOf(fnName) > -1

const isAutowaitFunction = fnName => ['click', 'see', 'seeElement', 'seeNumberOfVisibleElements', 'grabHTMLFrom', 'grabTextFrom', 'grabElementsFrom', 'fillField', 'switchTo'].indexOf(fnName) > -1

const actorFromActorOrPageObj = (actorOrPageObj) => actorOrPageObj.actor ? actorOrPageObj.actor : actorOrPageObj

const takeScreenshot = async (I, fn, args, isError = false) => {
    try {
        if (fn.name.indexOf('see') === 0 && isSelector(grabSelectorFromArgs(fn.name, args))) {
            try {
                await I._highlightElement(grabSelectorFromArgs(fn.name, args), `I.${fn.name}(${args.join(',') || ''})`, isError)
                if (isError) await I._scrollTo(grabSelectorFromArgs(fn.name, args))
            } catch (err) {}
        }

        // try {
        //     if (isError) await I._displayBoxGrid()
        // } catch (err) {}
        
        return await saveScreenshot(I, Date.now() / 1000, fn.name, args, isError ? 'error' : '', '')
    } catch (err) {
        console.log('ERROR Failed to save screenshot', err)
    }

}

const getPageUrlAndTitle = async I => {
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
            // console.log(`I.${fn.name} - calling...`)
            I._createOutputDirIfNecessary() // Must be here because we need to extract the test file name from the stacktrace

            /**
             * Automatically wait for elements to become visible
             */
            if (isAutowaitFunction(fn.name) && isSelector(grabSelectorFromArgs(fn.name, args))
            ) {
                try {
                    // await I._waitForVisible(grabSelectorFromArgs(fn.name, args))
                    // TODO better use an unwrapped function
                    await I._waitForVisible(grabSelectorFromArgs(fn.name, args), 10)
                } catch (err) {
                    // Just ignore that to avoid failing on StaleElementReferenceException
                    console.log(`WARN Failed to wait for element ${grabSelectorFromArgs(fn.name, args)}`, err)
                }
            }

            // Execute the step
            const ret = await fn2(...args)

            /**
             * Save screenshots after step execution
             */
            if (isWebdriverIO(I) && isAutoScreenshotFunction(fn.name)) {
                const screenshot = await takeScreenshot(I, fn, args)
                const page = await getPageUrlAndTitle(I)
                const codeStack = getCodeStack(stackOfMethod)
                
                I._storeForReport({ success: true, codeStack, screenshot, page })
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
            // const stack = parseMethodStack(stackOfMethod)
            // const sourceLocation = { file: stack.fileName, line: stack.lineNumber }
            
            I._storeForReport({ failed: true, message: errorMessage, orgStack: err.stack, codeStack, screenshot, page })

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
    const methods = methodsOfObject(actor)
    methods.forEach(method => {
        actor[method] = wrapFn(actor, actor[method])
    })
    actor.$isWrapped = true
    return actor
}

module.exports = {
    wrap
}
