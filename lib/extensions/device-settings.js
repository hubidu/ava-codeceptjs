const DEVICE_TYPES = ['mobile', 'tablet', 'desktop', 'android', 'ios']

function _setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings) {
    if (!deviceSettings.type) throw new Error('Please specify deviceSettings.type in _config.js')
    if (DEVICE_TYPES.indexOf(deviceSettings.type) === -1) throw new Error(`deviceSettings.type must be one of ${DEVICE_TYPES}`)

    this._deviceSettings = {
        deviceName,
        [deviceName] : Object.assign({}, deviceSettings, { browser: process.env.TEST_BROWSER || 'chrome' }),
        'default': Object.assign({}, defaultDeviceSettings, { browser: process.env.TEST_BROWSER || 'chrome' }),
    }
}

async function applyDeviceSettings(deviceName = this._deviceSettings.deviceName) {
    if (!this._deviceSettings[deviceName]) throw new Error(`Device Settings for ${deviceName} are not given`)

    const { width, height } = this._deviceSettings[deviceName]

    await this.resizeWindow(width, height)
}

module.exports = {
    _setDeviceSettings,
    applyDeviceSettings
}
