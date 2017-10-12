const HOST = undefined
const PORT = 4444
const URL = 'https://www.google.com'

module.exports = {
  default: {
    caps: [],
    timeouts: {
      waitForTimeout: 5000
    },
    host: HOST,
    url: URL,
    port: PORT,
    timeouts: {
      waitForTimeout: 5000
    }
  },

  iPhone: {
    caps: [],
    timeouts: {
      waitForTimeout: 5000
    },
    host: HOST,
    url: URL,
    port: PORT,
    timeouts: {
      waitForTimeout: 5000
    },

    deviceSettings: {
      width: 360,
      height: 3096
    },

    desiredCapabilities: {
      mobileEmulation: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
      }
    }
  }
}
