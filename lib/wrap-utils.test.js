const test  = require('ava')

const {_getCodeStack} = require('./wrap-utils')

test('_getCodeStack should return source code snippets from a  webdriverio stacktrace', t => {
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

test('_getCodeStack should return source code snippets from a nodejs assertion error', t => {
  const stackLines = [
    'AssertionError [ERR_ASSERTION]: \'bis 150 €\' == \'bis 300 €\'',
    'at RSTariffPage.seeInFilter (/versicherungscenter/_pages/tariff-rs.page.js:41:16)',
    'at <anonymous>',
    'at process._tickDomainCallback (internal/process/next_tick.js:228:7)',
  ]
  const res = _getCodeStack(stackLines)

  t.deepEqual(res,
    [ { file: '/versicherungscenter/_pages/tariff-rs.page.js', line: 41 } ]
  )
})

test('_getCodeStack should return source code snippets from successful execution of a command', t => {
  const stackLines = [
    'Error',
    'at WebDriverIO.wrapped [as say] (/server-consolidation/lib/wrap-methods.js:34:31)',
    'at ExecutionContext.step (/server-consolidation/lib/context-methods.js:67:33)',
    'at inBrowser (/versicherungscenter/fremdvertraege-hinzufuegen/test.test.js:18:5)',
    'at Test.fn (/server-consolidation/index.js:69:19)',
    'at <anonymous>',
    'at process._tickDomainCallback (internal/process/next_tick.js:228:7)'
  ]

  const res = _getCodeStack(stackLines)

  t.deepEqual(res,
    [ { file: '/versicherungscenter/fremdvertraege-hinzufuegen/test.test.js', line: 18 } ]
  )
})
