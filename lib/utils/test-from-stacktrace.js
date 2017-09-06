const parseErrorStack = (err) => {
    const ErrorStackParser = require('error-stack-parser')
    try {
        return ErrorStackParser.parse(err)[0]
    } catch (e) {
        console.log('Failed to parse error stack', e, err)
        return ''
    }
}

const truncToTestStacktrace = st => {
    st = st.splice(1)
    st = st.filter(sf => sf.indexOf('WebDriverIO.wrapped') === -1)  // strip wrapped methods from stacktrace

    const testFramePos = st.findIndex(sf => sf.match(/\.test\.js\:/))
    return st.splice(testFramePos)
}

module.exports = err => {
    err.stack = truncToTestStacktrace(err.stack.split('\n')).join('\n') // TODO Go through the stack and find the test
    return parseErrorStack(err)
}