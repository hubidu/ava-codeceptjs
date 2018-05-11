const grabBrowserLogsSafe = async actor => {
  const byTimestampDesc  = (a, b) => b.timestamp - a.timestamp

  if (!actor) return undefined
  if (!actor.browser) return undefined

  try {
      let logs1, logs2
      try { logs1 = await actor.browser.log('performance') } catch (_) {}
      try { logs2 = await actor.browser.log('browser') } catch (_) {}

      let allLogs = []
      if (logs1) {
        allLogs = allLogs.concat(logs1.value)
      }
      if (logs2) {
        allLogs = allLogs.concat(logs2.value)
      }

      allLogs = allLogs
        .filter(l => l.level === 'SEVERE')
        .sort(byTimestampDesc)

      return allLogs
  } catch (err) {
      console.log('WARNING Failed to grab browser logs', err)
      return undefined
  }
}

module.exports = grabBrowserLogsSafe
