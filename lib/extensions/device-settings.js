function _setDeviceSettings(deviceName, deviceSettings, defaultDeviceSettings) {
    this._deviceSettings = {
        deviceName,
        [deviceName] : deviceSettings,
        'default': defaultDeviceSettings
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