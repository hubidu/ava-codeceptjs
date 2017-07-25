const { saveScreenshot } = require('./screenshot-utils')

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
    'saveScreenshot',
    'highlightElement',
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
            } else if (fnName === 'seeNumberOfElements' || fnName === 'seeInField') {
                return args[0]
            } else {
                return args[1]
            }
        case 3: return args[2]
    }
}

const isAutoScreenshotFunction = fnName => ['see', 'say', 'seeElement', 'seeInField', 'dontSee', 'dontSeeElement', 'dontSeeInField'].indexOf(fnName) > -1
const actorFromActorOrPageObj = (actorOrPageObj) => actorOrPageObj.actor ? actorOrPageObj.actor : actorOrPageObj
const makeScreenshot = async (I, fn, args, isError = false) => {
    if (isAutoScreenshotFunction(fn.name)) {
        try {
            // console.log('AFTER', fn.name)
            if (fn.name.indexOf('see') === 0 && isSelector(grabSelectorFromArgs(fn.name, args))) {
                await I.highlightElement(grabSelectorFromArgs(fn.name, args), `${isError? 'ERROR' : 'OK' } "I.${fn.name}(${args.join(',') || ''})"`, isError)
            }

            await I.displayBoxGrid()
            await saveScreenshot(I, Date.now() / 1000, fn.name, args, isError ? 'error' : '', '')
        } catch (err) {
            console.log('ERROR Failed to save screenshot', err)
        }
    }

}


function wrapFn (actor, fn) {
    return async function wrapped(...args) {
        const fn2 = fn.bind(actor)

        const stackOfMethod = new Error()
        const I = actorFromActorOrPageObj(actor)

        try {
            // console.log(`I.${fn.name} - calling...`)
            I._createOutputDirIfNecessary() // Must be here to extract the test file name from stack trace

            /**
             * Automatically wait for elements to become visible
             */
            if (
                ['click', 'see', 'grabHTMLFrom', 'grabTextFrom', 'grabElementsFrom', 'fillField'].indexOf(fn.name) > -1 && 
                isSelector(grabSelectorFromArgs(fn.name, args))
            ) {
                try {
                    await actor.waitForVisible(grabSelectorFromArgs(fn.name, args), 20)
                } catch (err) {
                    // Just ignore that to avoid failing on StaleElementReferenceException
                }
            }

            // Execute the step
            const ret = await fn2(...args)

            /**
             * Save screenshots after step execution
             */
            await makeScreenshot(I, fn, args)
            // console.log(`I.${fn.name}: - result`, ret)
            return ret
        } catch (err) {
            // Ignore errors happening on saveScreenshot
            // Save screenshot should not be wrapped
            // if (fn.name === 'saveScreenshot') {
            //     return
            // }
            await makeScreenshot(I, fn, args, true)

            const newError = new Error(err.message || err.cliMessage())
            newError.stack = stackOfMethod.stack
            newError.orgStack = err.stack
            newError.actual = err.actual
            newError.expected = err.expected
            // Attach failed step data
            newError._failedStep = {
                name: fn.name,
                args
            }
            return Promise.reject(newError)
        }
    }
}

const wrap = (actor, Clazz) => {
    const methods = methodsOfObject(actor)
    methods.forEach(method => {
        actor[method] = wrapFn(actor, actor[method])
    })
    return actor
}

module.exports = {
    wrap
}
