const fs = require('fs')

const fileToStringSync = (path) => path ? fs.readFileSync(path, 'utf8') : undefined;

module.exports = {
  fileToStringSync
}
