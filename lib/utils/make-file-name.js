module.exports = (str) => {
  return str.replace(/[\r\n'":,;\\\/\*\?><]/g, '')
}
