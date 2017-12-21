const fs = require('fs')
const archiver = require('archiver')

var output = fs.createWriteStream('./reports.zip')
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

archive.pipe(output)

archive.directory('__out', false)

archive.finalize()

