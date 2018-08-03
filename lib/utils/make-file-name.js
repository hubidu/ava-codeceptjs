const makeFileName = str => str.replace(/[^0-9a-zA-Z\- \.\(\),]/g, '')

module.exports = makeFileName
