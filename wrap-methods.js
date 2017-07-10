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
    'debug'
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

function wrapFn (obj, fn) {
    return async function wrapped(...args) {
        // this.name = fn.name
        // console.log(`${opts.indent || ''}I.${fn.name} ${(args && args.join(' ')) || ''}`)
        const fn2 = fn.bind(obj)

        const stackOfMethod = new Error()
        try {
            // console.log(`I.${fn.name} - calling...`)
            if (['click', 'see', 'grabHTMLFrom', 'grabTextFrom', 'grabElementsFrom'].indexOf(fn.name) > -1 && isSelector(args[0])) {
                await obj.waitForVisible(args[0], 5)
            }
            const ret = await fn2(...args)

            // Save screenshot after each command
            if (process.env.DEBUG && fn.name !== 'saveScreenshot') {
                try {
                    // console.log('AFTER', fn.name)
                    await saveScreenshot(obj, Date.now() / 1000, fn.name, args, '', '__steps__')
                } catch (err) {
                    console.log(err)
                }
            }
            // console.log(`I.${fn.name}: - result`, ret)
            return ret
        } catch (err) {
            // Ignore errors happening on saveScreenshot
            if (fn.name === 'saveScreenshot') {
                return
            }

            const newError = new Error(err.message)
            newError.stack = stackOfMethod.stack
            newError.orgStack = err.stack
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
    const methods = methodsOfObject(obj, Clazz)
    methods.forEach(method => {
        obj[method] = wrapFn(obj, obj[method])
    })
    return obj
}

module.exports = {
    wrap
}
