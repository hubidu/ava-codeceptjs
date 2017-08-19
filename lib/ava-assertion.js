const { AssertionError } = require('ava/lib/assert')


const createAvaAssertion = (err, testStackframe, values = []) => {
    const avaAssertion = new AssertionError({
        name: 'AssertionError',
        assertion: 'is',
        improperUsage: false,
        message: err.message,
        fixedSource: { file: testStackframe.fileName, line: testStackframe.lineNumber },
        stack: err.stack,
        raw: err.actual ? { actual: err.actual, expected: err.expected } : undefined,
        values: err.actual ? [{ label: 'Difference', formatted: `${err.actual}\n${err.expected}`}] : undefined
    })
    return avaAssertion
}

module.exports = {
  createAvaAssertion
}