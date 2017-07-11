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

const isSelector = txt => txt && (txt.indexOf('#') >= 0 || txt.indexOf('.') >= 0 || txt.indexOf('>') >= 0)
const grabSelectorFromArgs = (fnName, args) => {
    switch (args.length) {
        case 1: return args[0]
        case 2: return fnName.indexOf('fill') === 0 ? args[0] : args[1]
        case 3: return args[2]
    }
}

function wrapFn (obj, fn) {
    return async function wrapped(...args) {
        const fn2 = fn.bind(obj)

        const stackOfMethod = new Error()
        try {
            // console.log(`I.${fn.name} - calling...`)

            /**
             * Automatically wait for elements to become visible
             */
            if (
                ['click', 'see', 'grabHTMLFrom', 'grabTextFrom', 'grabElementsFrom'].indexOf(fn.name) > -1 && 
                isSelector(grabSelectorFromArgs(fn.name, args))
            ) {
                await obj.waitForVisible(grabSelectorFromArgs(fn.name, args), 5)
            }

            // Execute the step
            const ret = await fn2(...args)

            /**
             * Save screenshots after step execution
             */
            if (
                (process.env.DEBUG && fn.name !== 'saveScreenshot') || 
                (fn.name === 'say' || fn.name.indexOf('see') === 0)
            ) {
                try {
                    // console.log('AFTER', fn.name)
                    await saveScreenshot(obj, Date.now() / 1000, fn.name, args, '', '__steps__')
                } catch (err) {
                    console.log('ERROR saving screenshot', err)
                }
            }
            // console.log(`I.${fn.name}: - result`, ret)
            return ret
        } catch (err) {
            // Ignore errors happening on saveScreenshot
            if (fn.name === 'saveScreenshot') {
                return
            }

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

const wrap = (obj, Clazz) => {
    const methods = methodsOfObject(obj)
    methods.forEach(method => {
        obj[method] = wrapFn(obj, obj[method])
    })
    return obj
}

module.exports = {
    wrap
}
