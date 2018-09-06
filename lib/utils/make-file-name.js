const trunc = (str, max = 20) => str.slice(0, max)
const makeFileName = str => trunc(str.replace(/[^0-9a-zA-Z\- \.\(\),]/g, ''))

module.exports = makeFileName
