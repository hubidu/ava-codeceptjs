const WebDriverIO = require('codeceptjs/lib/helper/WebDriverIO')
const Appium = require('codeceptjs/lib/helper/Appium')

const { saveScreenshot, saveSource } = require('./screenshot-utils')
const { parseStack } = require('./error-stack')

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

    return (
        txt.indexOf('#') >= 0 ||
        txt.indexOf('.') >= 0 ||
        txt.indexOf('>') >= 0 ||
        txt.indexOf('=') >= 0 ||
        txt.indexOf('[') >= 0 ||
        txt.indexOf('div') >= 0 ||
        txt.indexOf('span') >= 0 ||
        txt.indexOf('button') >= 0 ||
        txt.indexOf('input') >= 0 ||
        txt.indexOf('h1') >= 0 ||
        txt.indexOf('h2') >= 0 ||
        txt.indexOf('h3') >= 0 ||
        txt.indexOf('//') === 0
        || txt.indexOf('android=') === 0
    )
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
    return ['click', 'see', 'seeElement', 'seeNumberOfVisibleElements', 'grabHTMLFrom', 'grabTextFrom', 'fillField', 'switchTo', 'selectOption', 'scrollTo'].indexOf(fnName) > -1
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
                  // TODO Check the scrollTo method. Seems that it does not work anyway
                  // if (isError) await I._scrollTo(selectorFromArgs)
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
    if (!stackOfMethod.stack) {
      console.log('WARNING Expected stackOfMethod to have a stack property', typeof stackOfMethod, stackOfMethod)
      return []
    }
    const correctedStackLines = stackOfMethod.stack.split('\n')
    return _getCodeStack(correctedStackLines)
}

const correctStackLines = stackLines => stackLines
  .slice(1) // skip error message
  . filter(l => l.indexOf('.wrapped') === -1)
  . filter(l => l.indexOf('at on (') === -1)
  . filter(l => l.indexOf('ExecutionContext.') === -1)
  . filter(l => l.indexOf('index.js') === -1)
  . filter(l => l.indexOf('<anonymous>') === -1)
  . filter(l => l.indexOf('._tickDomainCallback') === -1)

const _getCodeStack = stackLines => {
  const getSourceLocation = stacktraceArray => {
      const err = new Error()
      err.stack = stacktraceArray.join('\n')
      const stack = parseStack(err)
      return { file: stack.fileName, line: stack.lineNumber }
  }

  const correctedStackLines = correctStackLines(stackLines)

  const codeStack = []

  for (let i = 0; i < correctedStackLines.length; i++) {
      codeStack.push(getSourceLocation(correctedStackLines.slice(i)))
  }

  return codeStack
}

module.exports = {
  methodsOfObject,
  isSelector,
  grabSelectorFromArgs,
  isAutoScreenshotFunction,
  isAutowaitFunction,
  actorFromActorOrPageObj,
  takeScreenshot,
  getPageUrlAndTitle,
  parseMethodStack,
  getCodeStack,
  _getCodeStack,
  correctStackLines
}
