const ErrorStackParser = require('error-stack-parser')

const parseStack = (err) => {
    try {
        return ErrorStackParser.parse(err)[0]
    } catch (e) {
        console.log('Failed to parse error stack', e, err)
        return ''
    }
}

module.exports = {
    parseStack
}