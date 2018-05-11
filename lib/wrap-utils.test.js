const test  = require('ava')

const {_getCodeStack} = require('./wrap-utils')

test('_getCodeStack should return source code snippets from a stacktrace', t => {
  const stackLines = [
    'Error',
    'at WebDriverIO.wrapped [as say] (/server-consolidation/lib/wrap-methods.js:23:31)',
    'at ExecutionContext.step (/server-consolidation/lib/context-methods.js:67:33)',
    'at inBrowser (/server-consolidation/test/web/sketch-test-outline.test.js:15:5)',
    'at <anonymous>',
    'at process._tickDomainCallback (internal/process/next_tick.js:228:7)    ',
  ]

  const res = _getCodeStack(stackLines)

  t.deepEqual(res,
    [{
      file: '/server-consolidation/test/web/sketch-test-outline.test.js',
      line: 15
    }]
  )
})
