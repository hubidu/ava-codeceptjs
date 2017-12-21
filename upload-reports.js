const fs = require('fs')
const request = require('request')

request({
  method: 'PUT',
  preambleCRLF: true,
  postambleCRLF: true,
  uri: 'http://service.com/upload',
  multipart: [
    { body: fs.createReadStream('./reports.zip') }
  ]
},
function (error, response, body) {
  if (error) {
    return console.error('upload failed:', error);
  }
  console.log('Upload successful!  Server responded with:', body);
})
