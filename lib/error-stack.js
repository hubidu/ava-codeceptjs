const ErrorStackParser = require('error-stack-parser')

const parseStack = (err) => {
    try {
        return ErrorStackParser.parse(err)[0]
    } catch (e) {
        console.log('ERROR Failed to parse error stack', e)
        console.log('  Error to parse was:', err)
        return ''
    }
}

module.exports = {
    parseStack
}
